#!/usr/bin/env python3
# filename: python/path.py

import os
import sys
import json
from datetime import datetime



def typeIconFile(name):

    extension = name.split('.')
    if len(extension) > 1:
        extension = extension[-1]
    else:
        extension = ""

    match extension:
        case "":
            return 'scalable/places/default-folder.svg'
        case "pdf":
            return 'scalable/mimetypes/application-pdf.svg'
        case "js":
            return 'scalable/mimetypes/application-javascript.svg'
        case "mp3":
            return 'scalable/mimetypes/audio-mp3.svg'
        case "png":
            return 'scalable/mimetypes/image-png.svg'
        case "jpg":
            return 'scalable/mimetypes/jpeg.svg'
        case "jpeg":
            return 'scalable/mimetypes/jpeg.svg'
        case "txt":
            return 'scalable/mimetypes/txt.svg'
        case "md":
            return 'scalable/mimetypes/text-markdown.svg'
        case "py":
            return 'scalable/mimetypes/text-x-python.svg'
        case "zip":
            return 'scalable/mimetypes/7zip.svg'
        case "azw":
            return 'scalable/mimetypes/application-epub+zip.svg'
        case "gz":
            return 'scalable/mimetypes/application-x-gz-font-linux-psf.svg'
        case "html":
            return 'scalable/mimetypes/html.svg'
        case "webp":
            return 'scalable/mimetypes/application-images.svg'
        case "psd":
            return 'scalable/mimetypes/image-x-psd.svg'
        case "ts":
            return 'scalable/mimetypes/text-x-typescript.svg'
        case "json":
            return 'scalable/mimetypes/application-json.svg'
        case "css":
            return 'scalable/mimetypes/text-css.svg'
        case "conf":
            return 'scalable/mimetypes/application-gnunet-directory.svg'
        case "scss":
            return 'scalable/mimetypes/text-x-scss.svg'
        case "svg":
            return 'scalable/mimetypes/svg.svg'
        case "xml":
            return 'scalable/mimetypes/application-metalink+xml.svg'
        case "":
            return 'scalable/mimetypes/'



        case _:
            return "scalable/mimetypes/gtk-file.svg"
  

def list_directory(path):
    """
    Lista o conteúdo de um diretório e retorna uma estrutura de dados.
    """
    items = []
    # Garante que o caminho seja absoluto para evitar problemas
    full_path = os.path.abspath(path)

    # Verifica se o caminho existe e é um diretório
    if not os.path.exists(full_path) or not os.path.isdir(full_path):
        return {"error": "Caminho não é um diretório ou não existe."}, 404

    try:
        # Itera sobre os itens no diretório
        for entry in os.scandir(full_path):
            stats = entry.stat()
            items.append({
                "name": entry.name,
                "path": os.path.join(path, entry.name),
                "is_dir": entry.is_dir(),
                "type": 'folder' if entry.is_dir() == True else 'file',
                "size": stats.st_size,
                "icon": typeIconFile(entry.name),
                "modified": datetime.fromtimestamp(stats.st_mtime).isoformat()
            })
        print(items)
        return {"path": full_path, "items": items}, 200

    except Exception as e:
        return {"error": f"Erro ao acessar o diretório: {e}"}, 500

if __name__ == "__main__":
    # Recebe o caminho do diretório como o primeiro argumento
    # Se nenhum argumento for fornecido, usa o diretório home do usuário
    if len(sys.argv) > 1:
        directory_path = sys.argv[1]
    else:
        directory_path = os.path.expanduser("~") # Diretório home

    # Chama a função para listar o diretório
    data, status_code = list_directory(directory_path)

    # Imprime a saída JSON para que o bash possa capturá-la
    print(json.dumps(data))

    # Para simular uma falha
    if status_code != 200:
        sys.exit(1)