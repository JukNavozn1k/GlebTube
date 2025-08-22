from django import forms

from users.models import User


class UserAdditionalForm(forms.ModelForm):    
    class Meta:
        model = User
        fields = ('bio','avatar')
        
        widgets = {
            
            'bio' : forms.Textarea(attrs={'class' : 'form-control','placeholder':'Ахуительное описание...'}),
            'avatar' : forms.FileInput(attrs={'class' : 'form-control form-control-sm'}),
           
        }
        labels = {
            'bio' : 'Описание профиля',
            'avatar' : 'Аватар',
        }
       