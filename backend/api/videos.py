from fastapi import APIRouter, HTTPException, status, Depends,UploadFile,Query,File,Form

from core import ObjectID


from schemas.videos import VideoOut
from schemas.pagination import PaginatedResponse

from services.videos import video_service

from dependencies.auth import get_current_user



from typing import Optional

router = APIRouter(prefix='/videos', tags=['Videos'])

@router.post('/', response_model=VideoOut)
async def create(title: str = Form(...),description: Optional[str] = Form(...), 
                 video: UploadFile = File(...), thumbnail: UploadFile = File(None),
                 user: dict = Depends(get_current_user)):
    video_path = await video_service.update_video(video)
    thumbnail_path = await video_service.update_thumbnail(thumbnail)

    new_video = VideoOut(title=title, channel=user, src=video_path, thumbnail=thumbnail_path, description=description)
    result = await video_service.create(new_video.model_dump())

    return result 


@router.get('/retrieve/{video_id}', response_model=VideoOut)
async def retrive(video_id: ObjectID):
    try:
        result = await video_service.retrieve(video_id)
    except Exception as e:
        HTTPException(status_code=422, detail=e.errors())
    else:
        if not result:
            raise HTTPException(status_code=404, detail="Video not found")
        return result
    

@router.get('/list', response_model=PaginatedResponse[VideoOut])
async def list(limit: int = Query(10, ge=1, le=100),
               offset: int = Query(0, ge=0),):
    result = await video_service.list(limit=limit, offset=offset)
    return PaginatedResponse[VideoOut](
        total=result["total"],
        items=[VideoOut(**item) for item in result["items"]],
        limit=limit,
        offset=offset
    )
