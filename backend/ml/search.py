import torch
import torch.nn.functional as F

from ml.encode import encode_texts


def semantic_search_knn(dataset, query, k=5, text_embeddings=None):
    """
    dataset: pytorch dataset с доступом dataset[i]['text']
    query: строка запроса
    k: количество ближайших соседей
    text_embeddings: (optional) заранее вычисленные эмбеддинги всех заголовков [N, D]
    
    Возвращает список (индекс, расстояние) отсортированных по возрастанию расстояния.
    """
    # Если эмбеддинги не переданы, считаем их
    if text_embeddings is None:
        texts = [dataset[i]['text'] for i in range(len(dataset))]
        text_embeddings = encode_texts(texts)  # Ваша функция для вычисления эмбеддингов
    
    query_emb = encode_texts([query])
    
    # Нормализуем эмбеддинги
    text_embeddings = F.normalize(text_embeddings, p=2, dim=1)
    query_emb = F.normalize(query_emb, p=2, dim=1)
    
    # Косинусная похожесть
    cos_sim = torch.matmul(text_embeddings, query_emb.T).squeeze(1)
    cos_dist = 1 - cos_sim
    
    # Берём топ-k ближайших по минимальному расстоянию
    k = min(k, len(cos_dist))
    topk_dist, topk_idx = torch.topk(cos_dist, k, largest=False)
    
    results = [(int(idx), float(dist.item())) for idx, dist in zip(topk_idx, topk_dist)]
    
    # Сортировка по возрастанию расстояния
    results_sorted = sorted(results, key=lambda x: x[1])
    return results_sorted


def search_by_embeddings(query_embedding, video_embeddings, videos_list, k=10):
    """
    query_embedding: torch.Tensor shape [D] или [1, D]
    video_embeddings: torch.Tensor shape [N, D]
    videos_list: список объектов Video
    k: top-k ближайших
    """
    if query_embedding.ndim == 1:
        query_embedding = query_embedding.unsqueeze(0)

    video_embeddings = F.normalize(video_embeddings, p=2, dim=1)
    query_embedding = F.normalize(query_embedding, p=2, dim=1)

    cos_sim = torch.matmul(video_embeddings, query_embedding.T).squeeze(1)
    cos_dist = 1 - cos_sim

    k = min(k, len(cos_dist))
    _, topk_idx = torch.topk(cos_dist, k, largest=False)
    return [videos_list[idx] for idx in topk_idx]


def semantic_search_videos(query, videos_qs, k=10):
    """
    query: строка запроса
    videos_qs: QuerySet Video с video_embedding (list[float])
    k: top-k
    Возвращает список Video в порядке похожести
    """
    videos_list = []
    embeddings_list = []
    for video in videos_qs:
        if video.video_embedding:
            embeddings_list.append(torch.tensor(video.video_embedding))
            videos_list.append(video)

    if not embeddings_list:
        return []

    video_embeddings = torch.stack(embeddings_list)
    query_emb = encode_texts([query])

    return search_by_embeddings(query_emb, video_embeddings, videos_list, k)
