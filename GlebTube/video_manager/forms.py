from django import forms

from . import models

class UploadForm(forms.ModelForm):
    class Meta:
        model =  models.Video
        fields = ['caption','description','video','thumbnail']
        widgets = {
            
            'caption' : forms.TextInput(attrs={'class' : 'form-control','placeholder':'Моё первое видео!'}),
            'video' : forms.FileInput(attrs={'class' : 'form-control form-control-sm',"accept" : "video/mp4"}),
            'thumbnail' : forms.FileInput(attrs={'class' : 'form-control form-control-sm'}),
            'description' : forms.Textarea(attrs={'class' : 'form-control','rows' : '3','placeholder':'Как я провёл лето...'})
        }
        labels = {
            'caption' : 'Название',
            'description' : 'Описание',
            'thumbnail' : 'Превью',
            'video' : 'Видео'

        }


class EditForm(forms.ModelForm):
    class Meta:
        model =  models.Video
        fields = ['caption','description','video','thumbnail']
        widgets = {
            
            'caption' : forms.TextInput(attrs={'class' : 'form-control','placeholder':'Моё первое видео!'}),
            'video' : forms.FileInput(attrs={'class' : 'form-control form-control-sm',"accept" : "video/mp4"}),
            'thumbnail' : forms.FileInput(attrs={'class' : 'form-control form-control-sm'}),
            'description' : forms.Textarea(attrs={'class' : 'form-control','rows' : '3','placeholder':'Как я провёл лето...'})
        }
        labels = {
            'caption' : 'Название',
            'description' : 'Описание',
            'img' : 'Превью',
            'video' : 'Видео'

        }

