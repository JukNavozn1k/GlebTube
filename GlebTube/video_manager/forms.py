from django import forms

from . import models

class UploadForm(forms.ModelForm):
    class Meta:
        model =  models.Video
        exclude = ['date_uploaded','author','views','stars_count']
        widgets = {
            
            'caption' : forms.TextInput(attrs={'class' : 'form-control','placeholder':'Моё первое видео!'}),
            'video' : forms.FileInput(attrs={'class' : 'form-control form-control-sm',"accept" : "video/*"}),
            'img' : forms.FileInput(attrs={'class' : 'form-control form-control-sm'}),
            'description' : forms.Textarea(attrs={'class' : 'form-control','rows' : '3','placeholder':'Как я провёл лето...'})
        }
        labels = {
            'caption' : 'Название',
            'description' : 'Описание',
            'img' : 'Превью',
            'video' : 'Видео'

        }


class EditForm(forms.ModelForm):
    class Meta:
        model =  models.Video
        exclude = ['date_uploaded','author','views','video','stars_count']
        widgets = {
            
            'caption' : forms.TextInput(attrs={'class' : 'form-control','placeholder':'Моё первое видео!'}),
            'video' : forms.FileInput(attrs={'class' : 'form-control form-control-sm',"accept" : "video/*"}),
            'img' : forms.FileInput(attrs={'class' : 'form-control form-control-sm'}),
            'description' : forms.Textarea(attrs={'class' : 'form-control','rows' : '3','placeholder':'Как я провёл лето...'})
        }
        labels = {
            'caption' : 'Название',
            'description' : 'Описание',
            'img' : 'Превью',
            'video' : 'Видео'

        }

