// Gerenciador de Arquivos - JavaScript
class FileManager {
    constructor() {
        this.currentPath = 'home';
        this.history = ['home'];
        this.historyIndex = 0;
        this.selectedItems = new Set();
        this.clipboard = null;
        this.clipboardAction = null; // 'copy' ou 'cut'
        this.isSelecting = false;
        this.selectionStart = { x: 0, y: 0 };
       
        // Dados simulados do sistema de arquivos
        this.fileSystem = {
            home: {
                type: 'folder',
                name: 'Home',
                items: [
                    { name: 'Desktop', type: 'folder', icon: 'fas fa-desktop', size: '4 KB', modified: '2024-01-15 10:30' },
                    { name: 'Documents', type: 'folder', icon: 'fas fa-file-alt', size: '12 KB', modified: '2024-01-14 15:45' },
                    { name: 'Downloads', type: 'folder', icon: 'fas fa-download', size: '8 KB', modified: '2024-01-13 09:20' },
                    { name: 'Music', type: 'folder', icon: 'fas fa-music', size: '6 KB', modified: '2024-01-12 14:10' },
                    { name: 'Pictures', type: 'folder', icon: 'fas fa-image', size: '10 KB', modified: '2024-01-11 11:55' },
                    { name: 'Public', type: 'folder', icon: 'fas fa-share-alt', size: '4 KB', modified: '2024-01-10 16:30' },
                    { name: 'Templates', type: 'folder', icon: 'fas fa-file', size: '4 KB', modified: '2024-01-09 13:25' },
                    { name: 'Videos', type: 'folder', icon: 'fas fa-video', size: '8 KB', modified: '2024-01-08 18:40' }
                ]
            },
            documents: {
                type: 'folder',
                name: 'Documents',
                items: [
                    { name: 'Relatório.pdf', type: 'file', icon: 'fas fa-file-pdf', size: '2.5 MB', modified: '2024-01-15 14:20' },
                    { name: 'Apresentação.pptx', type: 'file', icon: 'fas fa-file-powerpoint', size: '5.8 MB', modified: '2024-01-14 16:30' },
                    { name: 'Planilha.xlsx', type: 'file', icon: 'fas fa-file-excel', size: '1.2 MB', modified: '2024-01-13 10:15' },
                    { name: 'Texto.docx', type: 'file', icon: 'fas fa-file-word', size: '890 KB', modified: '2024-01-12 09:45' }
                ]
            },
            downloads: {
                type: 'folder',
                name: 'Downloads',
                items: [
                    { name: 'arquivo.zip', type: 'file', icon: 'fas fa-file-archive', size: '15.6 MB', modified: '2024-01-15 20:30' },
                    { name: 'imagem.jpg', type: 'file', icon: 'fas fa-image', size: '3.2 MB', modified: '2024-01-14 18:45' },
                    { name: 'video.mp4', type: 'file', icon: 'fas fa-video', size: '125 MB', modified: '2024-01-13 22:10' }
                ]
            },
            music: {
                type: 'folder',
                name: 'Music',
                items: [
                    { name: 'Álbum 1', type: 'folder', icon: 'fas fa-folder', size: '4 KB', modified: '2024-01-10 12:00' },
                    { name: 'música.mp3', type: 'file', icon: 'fas fa-music', size: '4.5 MB', modified: '2024-01-15 19:30' },
                    { name: 'playlist.m3u', type: 'file', icon: 'fas fa-list', size: '2 KB', modified: '2024-01-14 17:20' }
                ]
            },
            pictures: {
                type: 'folder',
                name: 'Pictures',
                items: [
                    { name: 'Férias', type: 'folder', icon: 'fas fa-folder', size: '4 KB', modified: '2024-01-08 15:30' },
                    { name: 'foto1.jpg', type: 'file', icon: 'fas fa-image', size: '2.8 MB', modified: '2024-01-15 12:45' },
                    { name: 'foto2.png', type: 'file', icon: 'fas fa-image', size: '1.9 MB', modified: '2024-01-14 14:20' },
                    { name: 'screenshot.png', type: 'file', icon: 'fas fa-image', size: '856 KB', modified: '2024-01-13 16:10' }
                ]
            },
            videos: {
                type: 'folder',
                name: 'Videos',
                items: [
                    { name: 'filme.mkv', type: 'file', icon: 'fas fa-video', size: '1.2 GB', modified: '2024-01-12 21:30' },
                    { name: 'tutorial.mp4', type: 'file', icon: 'fas fa-video', size: '45 MB', modified: '2024-01-11 10:15' }
                ]
            },
            trash: {
                type: 'folder',
                name: 'Trash',
                items: [
                    { name: 'arquivo_deletado.txt', type: 'file', icon: 'fas fa-file', size: '1 KB', modified: '2024-01-10 08:30' }
                ]
            }
        };
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.renderCurrentFolder();
        this.updateNavigationButtons();
    }
    
    bindEvents() {
        // Eventos da barra lateral
        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const path = e.currentTarget.dataset.path;
                if (path && this.fileSystem[path]) {
                    this.navigateTo(path);
                }
            });
        });
        
        // Eventos de navegação
        document.getElementById('back-btn').addEventListener('click', () => this.goBack());
        document.getElementById('forward-btn').addEventListener('click', () => this.goForward());
        
        // Eventos de visualização
        document.getElementById('view-grid').addEventListener('click', () => this.setViewMode('grid'));
        document.getElementById('view-list').addEventListener('click', () => this.setViewMode('list'));
        
        // Eventos do menu de contexto
        document.addEventListener('contextmenu', (e) => this.showContextMenu(e));
        document.addEventListener('click', (e) => this.hideContextMenu(e));
        
        // Eventos de seleção por arrastar
        document.getElementById('content-area').addEventListener('mousedown', (e) => this.startSelection(e));
        document.addEventListener('mousemove', (e) => this.updateSelection(e));
        document.addEventListener('mouseup', (e) => this.endSelection(e));
        
        // Eventos do teclado
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Eventos do breadcrumb
        this.updateBreadcrumb();
    }
    
    navigateTo(path) {
        if (this.fileSystem[path]) {
            // Atualizar histórico
            this.historyIndex++;
            this.history = this.history.slice(0, this.historyIndex);
            this.history.push(path);
            
            this.currentPath = path;
            this.selectedItems.clear();
            this.renderCurrentFolder();
            this.updateNavigationButtons();
            this.updateBreadcrumb();
            this.updateSidebarSelection();
        }
    }
    
    goBack() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.currentPath = this.history[this.historyIndex];
            this.selectedItems.clear();
            this.renderCurrentFolder();
            this.updateNavigationButtons();
            this.updateBreadcrumb();
            this.updateSidebarSelection();
        }
    }
    
    goForward() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.currentPath = this.history[this.historyIndex];
            this.selectedItems.clear();
            this.renderCurrentFolder();
            this.updateNavigationButtons();
            this.updateBreadcrumb();
            this.updateSidebarSelection();
        }
    }
    
    updateNavigationButtons() {
        const backBtn = document.getElementById('back-btn');
        const forwardBtn = document.getElementById('forward-btn');
        
        backBtn.disabled = this.historyIndex <= 0;
        forwardBtn.disabled = this.historyIndex >= this.history.length - 1;
    }
    
    updateBreadcrumb() {
        const breadcrumb = document.getElementById('breadcrumb');
        const currentFolder = this.fileSystem[this.currentPath];
        
        breadcrumb.innerHTML = `<span class="breadcrumb-item" data-path="${this.currentPath}">${currentFolder.name}</span>`;
        
        // Adicionar evento de clique ao breadcrumb
        breadcrumb.querySelector('.breadcrumb-item').addEventListener('click', (e) => {
            const path = e.target.dataset.path;
            if (path !== this.currentPath) {
                this.navigateTo(path);
            }
        });
    }
    
    updateSidebarSelection() {
        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.classList.remove('bg-nautilus-hover');
            if (item.dataset.path === this.currentPath) {
                item.classList.add('bg-nautilus-hover');
            }
        });
    }
    
    renderCurrentFolder() {
         var getDados = document.getElementById('dados-dir').value
        //  console.log(getDados)
         var dadosT = getDados.replace(/'/g, '"')
         .replace(/False/g, 'false')
         .replace(/True/g, 'true');
        //  console.log(dadosT)
        var dadosDir = JSON.parse(dadosT)
        // console.log(dadosDir)
        const fileGrid = document.getElementById('file-grid');
        const currentFolder = this.fileSystem[this.currentPath];
        
        if (!currentFolder) return;
        
        fileGrid.innerHTML = '';
        const user = document.getElementById('user').value;
//bg-nautilus-sidebar
        dadosDir.forEach((item, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item  rounded-lg pb-4 pt-4 cursor-pointer border border-transparent';
            fileItem.dataset.index = index;
            fileItem.dataset.name = item.name;
            fileItem.dataset.type = item.type;
           
            fileItem.innerHTML = `
                 <div class="flex flex-col items-center text-center">
                     <div class="text-4xl mb-2 ${item.type === 'folder' ? 'text-nautilus-folder' : 'text-nautilus-text-secondary'}">
                        <img width="80" src="/home/${user}/.local/share/icons/Tela-circle-purple/${item.icon}" alt=""> 
                     </div>
                    <div class="text-sm font-medium truncate w-full">${item.name}</div>
                 </div>
             `;


              // Eventos do item
            fileItem.addEventListener('click', (e) => this.selectItem(e, fileItem));
            fileItem.addEventListener('dblclick', (e) => this.openItem(e, item));
            fileItem.addEventListener('mouseenter', (e) => this.showTooltip(e, item));
            fileItem.addEventListener('mouseleave', () => this.hideTooltip());
            
            fileGrid.appendChild(fileItem);

            //console.log(item.name)
        })
        
        // currentFolder.items.forEach((item, index) => {
        //     const fileItem = document.createElement('div');
        //     fileItem.className = 'file-item bg-nautilus-sidebar rounded-lg p-4 cursor-pointer border border-transparent';
        //     fileItem.dataset.index = index;
        //     fileItem.dataset.name = item.name;
        //     fileItem.dataset.type = item.type;
            
        //     fileItem.innerHTML = `
        //         <div class="flex flex-col items-center text-center">
        //             <div class="text-4xl mb-2 ${item.type === 'folder' ? 'text-nautilus-folder' : 'text-nautilus-text-secondary'}">
        //                 <i class="${item.icon}"></i>
        //             </div>
        //             <div class="text-sm font-medium truncate w-full">${item.name}</div>
        //         </div>
        //     `;
            
        //     // Eventos do item
        //     fileItem.addEventListener('click', (e) => this.selectItem(e, fileItem));
        //     fileItem.addEventListener('dblclick', (e) => this.openItem(e, item));
        //     fileItem.addEventListener('mouseenter', (e) => this.showTooltip(e, item));
        //     fileItem.addEventListener('mouseleave', () => this.hideTooltip());
            
        //     fileGrid.appendChild(fileItem);
        // });
    }
    
    selectItem(e, fileItem) {
        if (!e.ctrlKey && !e.metaKey) {
            // Limpar seleção anterior se não estiver segurando Ctrl/Cmd
            this.selectedItems.clear();
            document.querySelectorAll('.file-item').forEach(item => {
                item.classList.remove('selected');
            });
        }
        
        const itemName = fileItem.dataset.name;
        if (this.selectedItems.has(itemName)) {
            this.selectedItems.delete(itemName);
            fileItem.classList.remove('selected');
        } else {
            this.selectedItems.add(itemName);
            fileItem.classList.add('selected');
        }
    }
    
    openItem(e, item) {
        var path = document.getElementById('path-dir').value
        if (item.type === 'folder') {
            window.location.href = `./file_search.sh.htm?rota=/${path}/${item.name}`
        } else {
            path = path.replace(/\/\/+/g, '/');            
            console.log(path);
            console.log(`Abrindo arquivo: ${item.name}`);
            _run(`xdg-open "${path}/${item.name}"`)
        }
    }
    
    showTooltip(e, item) {
        setTimeout(function () {
        
            const tooltip = document.getElementById('tooltip');
            tooltip.innerHTML = `
                <div><strong>${item.name}</strong></div>
                <div>Tamanho: ${item.size}</div>
                <div>Modificado: ${item.modified}</div>
            `;
            
            tooltip.style.left = e.pageX + 10 + 'px';
            tooltip.style.top = e.pageY + 10 + 'px';
            tooltip.classList.add('show');
        }, 100);
    }
    
    hideTooltip() {
        const tooltip = document.getElementById('tooltip');
        tooltip.classList.remove('show');
    }
    
    showContextMenu(e) {
        e.preventDefault();
        
        const contextMenu = document.getElementById('context-menu');
        contextMenu.style.left = e.pageX + 'px';
        contextMenu.style.top = e.pageY + 'px';
        contextMenu.classList.add('show');
        
        // Adicionar eventos aos itens do menu
        document.querySelectorAll('.context-item').forEach(item => {
            item.addEventListener('click', (e) => this.handleContextAction(e));
        });
    }
    
    hideContextMenu(e) {
        const contextMenu = document.getElementById('context-menu');
        if (!contextMenu.contains(e.target)) {
            contextMenu.classList.remove('show');
        }
    }
    
    handleContextAction(e) {
        const action = e.currentTarget.dataset.action;
        
        switch (action) {
            case 'copy':
                this.copySelectedItems();
                console.log(e)
                 Swal.fire('Copiado!')
                break;
            case 'cut':
                this.cutSelectedItems();
                break;
            case 'paste':
                this.pasteItems();
                break;
            case 'rename':
                this.renameSelectedItem();
                break;
            case 'delete':
                this.deleteSelectedItems();
                break;
            case 'properties':
                this.showProperties();
                break;
        }
        
        this.hideContextMenu({ target: document.body });
    }
    
    copySelectedItems() {
        if (this.selectedItems.size > 0) {
            this.clipboard = Array.from(this.selectedItems);
            this.clipboardAction = 'copy';
            console.log('Itens copiados:', this.clipboard);
        }
    }
    
    cutSelectedItems() {
        if (this.selectedItems.size > 0) {
            this.clipboard = Array.from(this.selectedItems);
            this.clipboardAction = 'cut';
            console.log('Itens recortados:', this.clipboard);
        }
    }
    
    pasteItems() {
        if (this.clipboard && this.clipboard.length > 0) {
            console.log(`Colando itens (${this.clipboardAction}):`, this.clipboard);
            Swal.fire(`Colando itens (${this.clipboardAction}):`, this.clipboard);
            // Aqui seria implementada a lógica real de colar
        }
    }
    
    renameSelectedItem() {
        if (this.selectedItems.size === 1) {
            const itemName = Array.from(this.selectedItems)[0];
            const newName = prompt('Novo nome:', itemName);
            if (newName && newName !== itemName) {
                console.log(`Renomeando ${itemName} para ${newName}`);
                // Aqui seria implementada a lógica real de renomear
            }
        }
    }
    
    deleteSelectedItems() {
        if (this.selectedItems.size > 0) {
            const items = Array.from(this.selectedItems);
            if (confirm(`Deseja excluir ${items.length} item(s)?`)) {
                console.log('Excluindo itens:', items);
                // Aqui seria implementada a lógica real de exclusão
            }
        }
    }
    
    showProperties() {
        if (this.selectedItems.size === 1) {
            const itemName = Array.from(this.selectedItems)[0];
            console.log(`Mostrando propriedades de: ${itemName}`);
            // Aqui seria implementada a lógica real de propriedades
        }
    }
    
    startSelection(e) {
        if (e.target.id === 'content-area' || e.target.id === 'file-grid') {
            this.isSelecting = true;
            this.selectionStart = { x: e.clientX, y: e.clientY };
            
            const selectionBox = document.getElementById('selection-box');
            selectionBox.style.left = e.clientX + 'px';
            selectionBox.style.top = e.clientY + 'px';
            selectionBox.style.width = '0px';
            selectionBox.style.height = '0px';
            selectionBox.style.display = 'block';
        }
    }
    
    updateSelection(e) {
        if (this.isSelecting) {
            const selectionBox = document.getElementById('selection-box');
            const width = Math.abs(e.clientX - this.selectionStart.x);
            const height = Math.abs(e.clientY - this.selectionStart.y);
            const left = Math.min(e.clientX, this.selectionStart.x);
            const top = Math.min(e.clientY, this.selectionStart.y);
            
            selectionBox.style.left = left + 'px';
            selectionBox.style.top = top + 'px';
            selectionBox.style.width = width + 'px';
            selectionBox.style.height = height + 'px';
            
            // Verificar quais itens estão dentro da seleção
            this.updateItemSelection(left, top, width, height);
        }
    }
    
    updateItemSelection(left, top, width, height) {
        const selectionRect = { left, top, right: left + width, bottom: top + height };
        
        document.querySelectorAll('.file-item').forEach(item => {
            const itemRect = item.getBoundingClientRect();
            const isIntersecting = !(
                itemRect.right < selectionRect.left ||
                itemRect.left > selectionRect.right ||
                itemRect.bottom < selectionRect.top ||
                itemRect.top > selectionRect.bottom
            );
            
            if (isIntersecting) {
                item.classList.add('selected');
                this.selectedItems.add(item.dataset.name);
            } else {
                item.classList.remove('selected');
                this.selectedItems.delete(item.dataset.name);
            }
        });
    }
    
    endSelection(e) {
        if (this.isSelecting) {
            this.isSelecting = false;
            const selectionBox = document.getElementById('selection-box');
            selectionBox.style.display = 'none';
        }
    }
    
    handleKeyboard(e) {
        switch (e.key) {
            case 'Delete':
                if (this.selectedItems.size > 0) {
                    this.deleteSelectedItems();
                }
                break;
            case 'F2':
                if (this.selectedItems.size === 1) {
                    this.renameSelectedItem();
                }
                break;
            case 'c':
                if (e.ctrlKey || e.metaKey) {
                    this.copySelectedItems();
                }
                break;
            case 'x':
                if (e.ctrlKey || e.metaKey) {
                    this.cutSelectedItems();
                }
                break;
            case 'v':
                if (e.ctrlKey || e.metaKey) {
                    this.pasteItems();
                }
                break;
            case 'a':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.selectAllItems();
                }
                break;
        }
    }
    
    selectAllItems() {
        this.selectedItems.clear();
        document.querySelectorAll('.file-item').forEach(item => {
            item.classList.add('selected');
            this.selectedItems.add(item.dataset.name);
        });
    }
    
    setViewMode(mode) {
        const gridBtn = document.getElementById('view-grid');
        const listBtn = document.getElementById('view-list');
        const fileGrid = document.getElementById('file-grid');
        
        if (mode === 'grid') {
            gridBtn.classList.add('bg-nautilus-hover');
            listBtn.classList.remove('bg-nautilus-hover');
            fileGrid.className = 'grid grid-cols-6 gap-6';
        } else {
            listBtn.classList.add('bg-nautilus-hover');
            gridBtn.classList.remove('bg-nautilus-hover');
            fileGrid.className = 'space-y-2';
            // Aqui seria implementada a visualização em lista
        }
    }
}



function changeDirectory(newPath) {
    // Escapa o caminho para passar como argumento de linha de comando
    const escapedPath = JSON.stringify(newPath);
    
    // Chama o script principal (index.sh) novamente com o novo caminho
    // O BigBashView irá re-executar o script e renderizar a nova página
    window.bbv.app.run(`${escapedPath}`);
}

// Exemplo de como você chamaria a função ao clicar em uma pasta
document.getElementById('file-grid').addEventListener('click', (event) => {
    const item = event.target.closest('.file-item');
    if (item) {
        // Obter o caminho do item (você precisará adicionar o data-path no HTML)
        const path = item.dataset.path;
        if (path) {
            changeDirectory(path);
        }
    }
});
// Inicializar o gerenciador de arquivos quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    new FileManager();
});

