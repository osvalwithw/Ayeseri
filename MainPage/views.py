from django.http import HttpResponse 
from django.template import Template, Context
import datetime

class Usuario(object):
    def __init__(self, nombre, apellido):
        self.nombre = nombre
        self.apellido = apellido

def index(request):
    
    P1=Usuario("pepo", "gonzales")
   # nombre = "Pepo"
    
    Docinicial = open("D:/Acedemico/Uni/Extra/Modular/mysite/mysite/Plantillas/plantillain.html")
    plt=Template(Docinicial.read())
    Docinicial.close()
    
    Ctx = Context({"nombre":P1.nombre, "apellido":P1.apellido})
    
    Salida=plt.render(Ctx)
        
    return HttpResponse(Salida)

def time(requst):
    
    time = datetime.datetime.now() 
    Domsec = open("D:/Acedemico/Uni/Extra/Modular/mysite/mysite/Plantillas/plantilla2.html")
    plt=Template(Domsec.read())
    Domsec.close()
    
    Ctx = Context({"momento": time})
    
    Salida=plt.render(Ctx)
        
    return HttpResponse(Salida)

def corason(requst):
    Domsec = open("D:/Acedemico/Uni/Extra/Modular/mysite/mysite/Plantillas/Morchis.html")
    plt=Template(Domsec.read())
    Domsec.close()
    
    Ctx = Context({"momento": time})
    
    Salida=plt.render(Ctx)
        
    return HttpResponse(Salida)