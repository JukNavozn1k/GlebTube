from django import forms
from .models import User

class AuthForm(forms.ModelForm):    
    class Meta:
        model = User
        
        fields = ['username','password','first_name','last_name','email']
        widgets = {
            
            'username' : forms.TextInput(attrs={'class' : 'form-control','placeholder':'World destroyer 2009'}),
            'email' : forms.EmailInput(attrs={'class' : 'form-control','placeholder':'example@example.com'}),
            'password' : forms.PasswordInput(attrs={'class' : 'form-control','placeholder':'qwerty123'}),
            'first_name' : forms.TextInput(attrs={'class' : 'form-control','placeholder':'Иван'}),
            'last_name' : forms.TextInput(attrs={'class' : 'form-control','placeholder':'Иванов'})
           
        }
        labels = {
            'username' : 'Имя пользователя',
            'password' : 'Пароль',
            'first_name' : 'Имя',
            'last_name' : 'Фамилия',
            'email' : 'Электронная почта'
          
        }
        help_texts = {
            'username': 'Имя пользователя должно быть уникальным и не может быть измененено',
            'password' : 'Хороший пароль – всегда комбинированный. В нем используются символы, буквы и цифры разного регистра. Длина пароля – желательно не менее 8 символов, а лучше не менее 12. Избегайте смысловых паролей: не используйте распространенные фразы или слова.',
            
        }