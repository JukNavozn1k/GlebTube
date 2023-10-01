from django import forms

from . import models

class UploadForm(forms.ModelForm):
    class Meta:
        model =  models.Video
        exclude = ['date_uploaded']
        