from django import forms

from . import models

class VideoForm(forms.ModelForm):
    class Meta:
        model =  models.Video
        exclude = ['date_uploaded','author','views']
        widgets = {
            
            'caption' : forms.TextInput(attrs={'class' : 'form-control','placeholder':'Моё первое видео!'}),
            'video' : forms.FileInput(attrs={'class' : 'form-control form-control-sm'}),
            'img' : forms.FileInput(attrs={'class' : 'form-control form-control-sm'}),
            'description' : forms.Textarea(attrs={'class' : 'form-control','rows' : '3','placeholder':'Как я провёл лето...'})
        }
        labels = {
            'caption' : 'Название',
            'description' : 'Описание',
            'img' : 'Превью',
            'video' : 'Видео'

        }

'''
class EditForm(UploadForm):
    class Meta:
        exclude = ['date_uploaded','author','views','video','img']
'''