import os
import uuid

import aiofiles

from core import settings

def get_file_location(file,directory):
    '''
       Добавляет соль к файлам, в случае дублирования имен 
    '''
    while True:
            # Добавляем соль к имени файла
            name, ext = os.path.splitext(file.filename)
            salted_name = f"{name}_{uuid.uuid4().hex[:8]}{ext}"  # Уникальная соль (8 символов)
            file_location = os.path.join(directory, salted_name)
            if not os.path.exists(file_location): break
    return file_location

async def upload(file):
    
        directory = settings.media_dir
        os.makedirs(directory, exist_ok=True)

        # Асинхронно сохраняем файл
        file_location = get_file_location(file,directory)
        
        async with aiofiles.open(file_location, 'wb') as file_object:
                content = await file.read()  # Асинхронно читаем содержимое файла
                await file_object.write(content)  # Асинхронно записываем файл
        return file_location

def get_file_location_raw(filename,directory):
    '''
       Добавляет соль к файлам, в случае дублирования имен 
    '''
    while True:
            # Добавляем соль к имени файла
            name, ext = os.path.splitext(filename)
            salted_name = f"{name}_{uuid.uuid4().hex[:8]}{ext}"  # Уникальная соль (8 символов)
            file_location = os.path.join(directory, salted_name)
            if not os.path.exists(file_location): break
    return file_location

async def upload_raw(filename,content):
    
        directory = settings.media_dir
        os.makedirs(directory, exist_ok=True)

        # Асинхронно файл
        file_location = get_file_location_raw(filename,directory)
        
        async with aiofiles.open(file_location, 'wb') as file_object:
                await file_object.write(content)  # Асинхронно записываем файл
        return file_location