from abc import ABC, abstractmethod

from typing import List, Dict, Optional, Any
from collections import defaultdict
from beanie import Document,Link,BackLink
from typing import Type

class AbstractRepository(ABC):
    @abstractmethod
    async def create(self, data: Dict) -> Dict:
        raise NotImplementedError

    @abstractmethod
    async def retrieve(self, pk: int) -> Optional[Dict]:
        raise NotImplementedError

    @abstractmethod
    async def retrieve_by_field(self, field_name: str, value: Any) -> Optional[Dict]:
        raise NotImplementedError

    @abstractmethod
    async def list(self, filters: Optional[Dict] = None, limit: Optional[int] = None, offset: Optional[int] = None) -> Dict:
        """
        Получение списка сущностей с пагинацией.
        Возвращает словарь: {"total": int, "items": List[Dict]}
        """
        raise NotImplementedError

    @abstractmethod
    async def update(self, pk: int, data: Dict) -> Optional[Dict]:
        raise NotImplementedError

    @abstractmethod
    async def delete(self, pk: int) -> bool:
        raise NotImplementedError

    @abstractmethod
    async def create_many(self, data_list: List[Dict]) -> List[Dict]:
        raise NotImplementedError

    @abstractmethod
    async def retrieve_by_field(self, field_name: str, value: Any) -> Optional[Dict]:
        raise NotImplementedError

    @abstractmethod
    async def update_many(self, filters: Dict, update_data: Dict) -> int:
        raise NotImplementedError

    @abstractmethod
    async def delete_many(self, filters: Dict) -> int:
        raise NotImplementedError



class AbstractMongoRepository(AbstractRepository):
    """
    Абстрактный репозиторий для MongoDB на базе Beanie с поддержкой Link-сущностей.
    Ожидается, что self.model является подклассом beanie.Document.
    """
    def __init__(self, model: Type[Document]):
        self.model = model

    async def _prepare_data_with_links(self, data: Dict) -> Dict:
        """
        Обрабатывает данные перед созданием документа с batch-операциями.
        """
        
        # Регистр для массовых операций
        link_operations = defaultdict(lambda: {
            'ids': set(),
            'filters': [],
            'new_docs': [],
            'model': None
        })

        # Первый проход: сбор всех ссылок
        for field, field_info in self.model.__fields__.items():
            if field not in data:
                continue

            field_type = getattr(field_info, "outer_type_", None) or field_info.annotation
            if not hasattr(field_type, '__origin__'):
                continue

            origin_type = field_type.__origin__

            # Обработка одиночных Link и BackLink
            if origin_type in (Link, BackLink):
                linked_model = field_type.__args__[0]
                link_data = data[field]
                link_id = link_data.get("id") or link_data.get("_id")
                
                key = f"single_{origin_type.__name__}_{linked_model.__name__}"
                link_operations[key]['model'] = linked_model
                
                if link_id:
                    link_operations[key]['ids'].add(link_id)
                else:
                    link_operations[key]['filters'].append(
                        {k: v for k, v in link_data.items() if k not in ("id", "_id")}
                    )

            # Обработка List[Link] и List[BackLink]
            elif origin_type in (list, List) and len(field_type.__args__) > 0:
                item_type = field_type.__args__[0]
                if hasattr(item_type, '__origin__') and item_type.__origin__ in (Link, BackLink):
                    link_origin = item_type.__origin__
                    linked_model = item_type.__args__[0]
                    link_data_list = data[field]
                    
                    key = f"list_{link_origin.__name__}_{linked_model.__name__}"
                    link_operations[key]['model'] = linked_model
                    
                    for link_data in link_data_list:
                        link_id = link_data.get("id") or link_data.get("_id")
                        if link_id:
                            link_operations[key]['ids'].add(link_id)
                        else:
                            link_operations[key]['filters'].append(
                                {k: v for k, v in link_data.items() if k not in ("id", "_id")}
                            )
                        link_operations[key]['new_docs'].append(link_data)

        # Массовый поиск документов
        found_docs = defaultdict(dict)
        for key, op in link_operations.items():
            model = op['model']
            query = {"$or": []}
            
            if op['ids']:
                query["$or"].append({"_id": {"$in": list(op['ids'])}})
            
            if op['filters']:
                query["$or"].extend([{"$and": [flt]} for flt in op['filters']])
            
            if query["$or"]:
                docs = await model.find(query).to_list()
                found_docs[key] = {
                    str(doc.id): doc for doc in docs
                }

        # Массовая вставка новых документов
        new_docs_cache = defaultdict(dict)
        for key, op in link_operations.items():
            model = op['model']
            new_docs = []
            
            for doc_data in op['new_docs']:
                doc_id = doc_data.get("id") or doc_data.get("_id")
                if not doc_id and not any(
                    doc_data.items() <= doc.items()
                    for doc in found_docs[key].values()
                ):
                    new_docs.append(model(**doc_data))
            
            if new_docs:
                inserted = await model.insert_many(new_docs)
                new_docs_cache[key] = {str(doc.id): doc for doc in inserted}

        # Второй проход: замена данных
        for field, field_info in self.model.__fields__.items():
            if field not in data:
                continue

            field_type = getattr(field_info, "outer_type_", None) or field_info.annotation
            if not hasattr(field_type, '__origin__'):
                continue

            origin_type = field_type.__origin__

            # Обработка Link/BackLink
            if origin_type in (Link, BackLink):
                linked_model = field_type.__args__[0]
                link_data = data[field]
                key = f"single_{origin_type.__name__}_{linked_model.__name__}"
                
                doc_id = str(link_data.get("id") or link_data.get("_id"))
                data[field] = found_docs[key].get(doc_id) or new_docs_cache[key].get(doc_id)

            # Обработка List[Link]/List[BackLink]
            elif origin_type in (list, List) and len(field_type.__args__) > 0:
                item_type = field_type.__args__[0]
                if hasattr(item_type, '__origin__') and item_type.__origin__ in (Link, BackLink):
                    link_origin = item_type.__origin__
                    linked_model = item_type.__args__[0]
                    link_data_list = data[field]
                    key = f"list_{link_origin.__name__}_{linked_model.__name__}"
                    
                    updated_list = []
                    for link_data in link_data_list:
                        doc_id = str(link_data.get("id") or link_data.get("_id"))
                        filters = {k: v for k, v in link_data.items() if k not in ("id", "_id")}
                        
                        # Ищем сначала по ID, потом по фильтрам
                        if doc_id:
                            doc = found_docs[key].get(doc_id) or new_docs_cache[key].get(doc_id)
                        else:
                            doc = next(
                                (d for d in found_docs[key].values() 
                                if filters.items() <= d.dict().items()),
                                None
                            )
                        
                        if not doc:
                            doc = new_docs_cache[key].get(
                                next((k for k, v in new_docs_cache[key].items() 
                                    if filters.items() <= v.dict().items()), None)
                            )
                        
                        updated_list.append(doc or linked_model(**link_data))
                    
                    data[field] = updated_list

        return data


    async def create(self, data: Dict) -> Dict:
        """
        Создание одной сущности с поддержкой Link-сущностей.
        """
        data = await self._prepare_data_with_links(data)
        document = self.model(**data)
        await document.insert()
        return document.model_dump()

    async def create_many(self, data_list: List[Dict]) -> List[Dict]:
        """
        Создание множества сущностей с поддержкой Link-сущностей.
        Обрабатываем каждую запись отдельно.
        """
        prepared_data_list = []
        for data in data_list:
            prepared_data = await self._prepare_data_with_links(data)
            prepared_data_list.append(prepared_data)
        documents = [self.model(**data) for data in prepared_data_list]
        await self.model.insert_many(documents)
        return [doc.model_dump() for doc in documents]

    async def _populate_field(self, document: Document, field_path: str) -> None:
        """
        Рекурсивно заполняет поле по указанному пути (например, "roles.permissions").
        Сохраняет существующую логику, но добавляет обработку None-документов.
        """
        if not document:
            return

        parts = field_path.split('.')
        current_document = document
        
        for part in parts:
            if hasattr(current_document, 'fetch_link'):
                await current_document.fetch_link(part)
            
            current_document = getattr(current_document, part, None)
            if current_document is None:
                break

    async def _populate_document(self, document: Document, populate: List[str]) -> None:
        """
        Улучшенная версия с поддержкой:
        - wildcard (*) через fetch_all_links
        - сохранением существующей логики вложенных полей
        - обработкой дубликатов полей
        """
        if not document or not populate:
            return

        # Обработка wildcard
        if "*" in populate:
            if hasattr(document, 'fetch_all_links'):
                await document.fetch_all_links()
            return

        # Уникальные поля для подгрузки (без дубликатов)
        unique_fields = set()
        nested_fields = []
        
        for field in populate:
            if '.' in field:
                # Для вложенных полей сохраняем полный путь
                nested_fields.append(field)
            else:
                unique_fields.add(field)

        # Подгрузка корневых полей
        for field in unique_fields:
            if hasattr(document, 'fetch_link'):
                await document.fetch_link(field)

        # Рекурсивная подгрузка вложенных полей
        for field in nested_fields:
            await self._populate_field(document, field)

    async def retrieve(self, pk: Any, populate: Optional[List[str]] = None) -> Optional[Dict]:
        """
        Получение одной сущности по первичному ключу.
        Если передан populate, заполняет связанные Link-сущности.
        """
        document = await self.model.get(pk)
        if document and populate:
            await self._populate_document(document, populate)
        return document.model_dump() if document else None

    async def retrieve_by_field(self, field_name: str, value: Any, populate: Optional[List[str]] = None) -> Optional[Dict]:
        """
        Получение одной сущности по значению произвольного поля.
        """
        document = await self.model.find_one({field_name: value})
        if document and populate:
            await self._populate_document(document, populate)
        return document.model_dump() if document else None

    async def list(self, filters: Optional[Dict] = None, limit: Optional[int] = None, offset: Optional[int] = None, populate: Optional[List[str]] = None) -> Dict:
        """
        Получение списка сущностей с пагинацией.
        Возвращает словарь: {"total": int, "items": List[Dict]}
        """
        filters = filters or {}
        total = await self.model.find(filters).count()
        cursor = self.model.find(filters)
        if offset:
            cursor = cursor.skip(offset)
        if limit:
            cursor = cursor.limit(limit)
        documents = await cursor.to_list()
        if populate:
            for doc in documents:
                await self._populate_document(doc, populate)
        return {"total": total, "items": [doc.model_dump() for doc in documents]}

    async def update(self, pk: Any, data: Dict, populate: Optional[List[str]] = None) -> Optional[Dict]:
        """
        Обновление сущности по первичному ключу с поддержкой Link-сущностей.
        Если для Link-поля передается словарь, создаётся новый связанный документ.
        """
        document = await self.model.get(pk)
        if not document:
            return None

        # Если в данных есть Link-поля, обрабатываем их отдельно
        data = await self._prepare_data_with_links(data)

        for key, value in data.items():
            setattr(document, key, value)
        await document.save()
        if populate:
            await self._populate_document(document, populate)
        return document.model_dump()

    async def update_many(self, filters: Dict, update_data: Dict) -> int:
        """
        Массовое обновление сущностей по фильтру.
        Используется оператор "$set" для обновления.
        В update_many не обрабатываем вложенные Link-сущности, так как они обновляются отдельно.
        """
        update_result = await self.model.find(filters).update({"$set": update_data})
        return update_result.modified_count

    async def delete(self, pk: Any) -> bool:
        """
        Удаление одной сущности по первичному ключу.
        """
        document = await self.model.get(pk)
        if document:
            await document.delete()
            return True
        return False

    async def delete_many(self, filters: Dict) -> int:
        """
        Массовое удаление сущностей по фильтру.
        """
        delete_result = await self.model.find(filters).delete()
        return delete_result.deleted_count