
from videos.models import Video
from profiles.models import WatchHistory

def format_video_text(video: Video) -> str:
    description = video.description or ""
    date_uploaded = video.date_uploaded.isoformat() if video.date_uploaded else ""

    author = video.author
    profile_description = author.profile_description or ""
    stars_count = getattr(video, 'stars_count', 0)  # если есть у видео
    views_count = getattr(video, 'views', 0)
    author_stars = getattr(author, 'stars_count', 0)
    author_subs = getattr(author, 'subs_count', 0)
    return (
        f"{video.caption} {description} {author.username} "
        f"{video.duration} {stars_count} {views_count} "
        f"{author_stars} {author_subs} "
        f"{date_uploaded}"
        f"{profile_description} "
        
    )



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


