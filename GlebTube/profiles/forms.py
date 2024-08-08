from django import forms

from auths.models import User


class UserAdditionalForm(forms.ModelForm):    
    class Meta:
        model = User
        fields = ('profile_description','avatar',)
        
        widgets = {
            
            'profile_description' : forms.Textarea(attrs={'class' : 'form-control','placeholder':'Ахуительное описание...'}),
            'avatar' : forms.FileInput(attrs={'class' : 'form-control form-control-sm'}),
           
        }
        labels = {
            'profile_description' : 'Описание профиля',
            'avatar' : 'Аватар',
        }
       