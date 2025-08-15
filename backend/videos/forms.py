from django import forms

from . import models

class UploadForm(forms.ModelForm):
    class Meta:
        model =  models.Video
        fields = ['title','description','src','thumbnail']
        widgets = {
            
            'title' : forms.TextInput(attrs={'class' : 'form-control','placeholder':'Моё первое видео!'}),
            'src' : forms.FileInput(attrs={'class' : 'form-control form-control-sm',"accept" : "video/mp4"}),
            'thumbnail' : forms.FileInput(attrs={'class' : 'form-control form-control-sm'}),
            'description' : forms.Textarea(attrs={'class' : 'form-control','rows' : '3','placeholder':'Как я провёл лето...'})
        }
        labels = {
            'title' : 'Название',
            'description' : 'Описание',
            'thumbnail' : 'Превью',
            'src' : 'Видео'

        }


class EditForm(forms.ModelForm):
    class Meta:
        model =  models.Video
        fields = ['title','description','thumbnail']
        widgets = {
            
            'title' : forms.TextInput(attrs={'class' : 'form-control','placeholder':'Моё первое видео!'}),
            'thumbnail' : forms.FileInput(attrs={'class' : 'form-control form-control-sm'}),
            'description' : forms.Textarea(attrs={'class' : 'form-control','rows' : '3','placeholder':'Как я провёл лето...'})
        }
        labels = {
            'title' : 'Название',
            'description' : 'Описание',
            'img' : 'Превью',

        }

