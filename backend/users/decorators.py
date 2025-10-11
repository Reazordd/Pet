from django.views.decorators.csrf import csrf_exempt

def csrf_exempt_view(view_func):
    return csrf_exempt(view_func)
