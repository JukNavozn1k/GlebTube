
from videos.models import Video
from profiles.models import WatchHistory

def format_video_text(video: Video) -> str:
    parts = []
    parts.append(f"caption: {video.caption or ''}")
    if video.description:
        parts.append(f"description: {video.description}")
    if video.author:
        parts.append(f"author: {video.author.username}")
        if video.author.profile_description:
            parts.append(f"author_bio: {video.author.profile_description}")
    if hasattr(video, 'stars_count'):
        parts.append(f"stars_count: {video.stars_count}")
    if hasattr(video, 'views'):
        parts.append(f"views: {video.views}")
    if hasattr(video.author, 'stars_count'):
        parts.append(f"author_stars: {video.author.stars_count}")
    if hasattr(video.author, 'subs_count'):
        parts.append(f"author_subs: {video.author.subs_count}")
    if video.date_uploaded:
        parts.append(f"date_uploaded: {video.date_uploaded.isoformat()}")

    return " | ".join(parts)



import numpy as np
from sklearn.cluster import DBSCAN

def cluster_watch_history(user_id, eps=0.3, min_samples=2):
    """
    eps — порог косинусного расстояния (0 = идентично, 1 = противоположно).
    Для косинусного сходства 0.3 примерно означает сходство > 0.7.
    """
    # Загружаем историю просмотров
    history = (
        WatchHistory.objects
        .filter(viewer_id=user_id)
        .select_related('video')
        .only('video__video_embedding')
    )

    embeddings = []
    for item in history:
        emb = item.video.video_embedding
        if emb is not None:
            embeddings.append(emb)

    if not embeddings:
        return []

    X = np.array(embeddings, dtype=np.float32)

    # DBSCAN с косинусным расстоянием
    clustering = DBSCAN(eps=eps, min_samples=min_samples, metric='cosine').fit(X)
    labels = clustering.labels_

    # Группировка по кластерам
    clusters = {}
    for label, emb in zip(labels, X):
        if label == -1:  # Шум
            continue
        clusters.setdefault(label, []).append(emb)

    # Средний вектор и размер кластера
    result = []
    for label, cluster_embs in clusters.items():
        cluster_arr = np.array(cluster_embs)
        mean_vector = cluster_arr.mean(axis=0)
        result.append({
            "cluster_id": label,
            "mean_vector": mean_vector.tolist(),
            "count": len(cluster_embs)
        })

    return result


