import torch
import torch.nn.functional as F
from ml.encode import encode_texts


def semantic_search_knn(dataset, query, text_embeddings=None, normalize=True):
    """
    dataset: pytorch dataset с доступом dataset[i]['text']
    query: строка запроса
    text_embeddings: (optional) заранее вычисленные эмбеддинги [N, D]
    normalize: нужно ли нормализовать эмбеддинги
    
    Возвращает список (индекс, similarity) отсортированных по убыванию косинусной похожести.
    """
    if text_embeddings is None:
        texts = [dataset[i]['text'] for i in range(len(dataset))]
        text_embeddings = encode_texts(texts)  # [N, D]

    query_emb = encode_texts([query])  # [1, D]

    if normalize:
        text_embeddings = F.normalize(text_embeddings, p=2, dim=1)
        query_emb = F.normalize(query_emb, p=2, dim=1)

    # Косинусная похожесть [N]
    cos_sim = torch.matmul(text_embeddings, query_emb.T).squeeze(1)

    # Сортировка по убыванию схожести
    sorted_idx = torch.argsort(cos_sim, descending=True)

    results = [(int(idx), float(cos_sim[idx].item())) for idx in sorted_idx]
    return results


def search_by_embeddings(query_embedding, video_embeddings, videos_list, normalize=True):
    """
    query_embedding: torch.Tensor [D] или [1, D]
    video_embeddings: torch.Tensor [N, D]
    videos_list: список Video
    """
    if query_embedding.ndim == 1:
        query_embedding = query_embedding.unsqueeze(0)

    if normalize:
        video_embeddings = F.normalize(video_embeddings, p=2, dim=1)
        query_embedding = F.normalize(query_embedding, p=2, dim=1)

    cos_sim = torch.matmul(video_embeddings, query_embedding.T).squeeze(1)
    sorted_idx = torch.argsort(cos_sim, descending=True)

    return [videos_list[idx] for idx in sorted_idx]


def semantic_search_videos(query, videos_qs, normalize=True):
    """
    query: строка запроса
    videos_qs: QuerySet Video с video_embedding (list[float])
    Возвращает все Video, отсортированные по убыванию косинусной похожести
    """
    videos_list, embeddings_list = [], []
    for video in videos_qs:
        if video.video_embedding:
            embeddings_list.append(torch.tensor(video.video_embedding))
            videos_list.append(video)

    if not embeddings_list:
        return []

    video_embeddings = torch.stack(embeddings_list)
    query_emb = encode_texts([query])

    return search_by_embeddings(query_emb, video_embeddings, videos_list, normalize=normalize)


def semantic_search_videos_by_embedding(query_video, videos_qs, normalize=True):
    """
    query_video: Video (объект модели) с готовым video_embedding
    videos_qs: QuerySet Video с заполненным video_embedding
    Возвращает список Video, отсортированных по косинусной близости
    """
    if not query_video.video_embedding:
        return []

    videos_list, embeddings_list = [], []
    for video in videos_qs:
        if video.video_embedding:
            embeddings_list.append(torch.tensor(video.video_embedding))
            videos_list.append(video)

    if not embeddings_list:
        return []

    query_emb = torch.tensor(query_video.video_embedding).unsqueeze(0)
    video_embeddings = torch.stack(embeddings_list)

    if normalize:
        video_embeddings = F.normalize(video_embeddings, p=2, dim=1)
        query_emb = F.normalize(query_emb, p=2, dim=1)

    cos_sim = torch.matmul(video_embeddings, query_emb.T).squeeze(1)
    sorted_idx = torch.argsort(cos_sim, descending=True)

    return [videos_list[idx] for idx in sorted_idx]