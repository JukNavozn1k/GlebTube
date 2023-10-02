from django import forms
from django.contrib.auth.models import User

class AuthForm(forms.ModelForm):    
    class Meta:
        model = User
        fields = ['username','password',]
        widgets = {
            
            'username' : forms.TextInput(attrs={'class' : 'form-control','placeholder':'Моё первое видео!'}),
            'password' : forms.PasswordInput(attrs={'class' : 'form-control'}),
           
        }
        labels = {
            'username' : 'Имя пользователя',
            'password' : 'Пароль',
          
        }
        help_texts = {
            'username': 'Имя пользователя должно быть уникальным и не может быть измененено',
            'password' : None
        }