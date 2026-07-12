import pkgutil
import importlib

for _, nombre_modulo, _ in pkgutil.iter_modules(__path__):
    importlib.import_module(f"{__name__}.{nombre_modulo}")