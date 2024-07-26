from django import forms

from . models import UserAdditional


class UserAdditionalForm(forms.ModelForm):    
    class Meta:
        model = UserAdditional
        fields = ('profile_description','avatar',)
        
        widgets = {
            
            'profile_description' : forms.Textarea(attrs={'class' : 'form-control','placeholder':'Ахуительное описание...'}),
            'avatar' : forms.FileInput(attrs={'class' : 'form-control form-control-sm'}),
           
        }
        labels = {
            'profile_description' : 'Описание профиля',
            'avatar' : 'Аватар',
        }
       