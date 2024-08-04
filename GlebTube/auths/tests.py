from django.test import TestCase
from . import forms
from django.contrib.auth.models import User

class TestLogin(TestCase):
    def test_form(self):
        usr1 = {
            'username' : 'user',
            'password' : '1234'
        }
        usr2 = {}
        usr3 = {'username' : 'user',
                'password': None}
        
        usr4 = {'username' : 'user',
                'password': '1234',
                'first_name' : 'Fname',
                'last_name' : 'Lname',
                'email': 'ddd'
                }
        
        usr5 = {'username' : 'user',
                'password': '1234',
                'first_name' : 'Fname',
                'last_name' : 'Lname',
                'email': 'test@email.com'
                }
        
        form1 = forms.AuthForm(data=usr1) 
        form2 = forms.AuthForm(data=usr2)
        form3 = forms.AuthForm(data=usr3)
        form4 = forms.AuthForm(data=usr4)
        form5 = forms.AuthForm(data=usr5)
        
        self.assertEqual(form1.is_valid(),True)
        self.assertEqual(form2.is_valid(),False)
        self.assertEqual(form3.is_valid(),False)
        self.assertEqual(form4.is_valid(),False)
        self.assertEqual(form5.is_valid(),True)