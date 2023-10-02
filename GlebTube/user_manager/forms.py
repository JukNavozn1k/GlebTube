from django import forms
from django.contrib.auth.models import User

class AuthForm(forms.ModelForm):    
    class Meta:
        model = User
        
        fields = ['username','password','first_name','last_name','email']
        widgets = {
            
            'username' : forms.TextInput(attrs={'class' : 'form-control','placeholder':'World destroyer 2009'}),
            'email' : forms.TextInput(attrs={'class' : 'form-control','placeholder':'example@example.com'}),
            'password' : forms.PasswordInput(attrs={'class' : 'form-control','placeholder':'qwerty123'}),
           
        }
        labels = {
            'username' : 'Имя пользователя',
            'password' : 'Пароль',
            'first_name' : 'Имя',
            'last_name' : 'Фамилия'
          
        }
        help_texts = {
            'username': 'Имя пользователя должно быть уникальным и не может быть измененено',
            'password' : None,
            
        }