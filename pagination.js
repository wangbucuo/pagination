/**
 * 纯 JavaScript 分页库
 * 提供简单易用的分页功能，不依赖任何外部框架
 */
class Pagination {
    /**
     * 构造函数，初始化分页参数
     * @param {Object} options - 配置选项
     * @param {number} options.totalItems - 总项目数
     * @param {number} [options.itemsPerPage=9] - 每页显示的项目数
     * @param {number} [options.currentPage=1] - 当前页码
     * @param {number} [options.maxVisiblePages=5] - 最多显示的可见页码数
     * @param {function} options.onPageChange - 页码变化时的回调函数
     */
    constructor(options) {
        // 合并默认配置和用户传入的配置
        this.config = {
            totalItems: options.totalItems,
            itemsPerPage: options.itemsPerPage || 9,
            currentPage: options.currentPage || 1,
            maxVisiblePages: options.maxVisiblePages || 5,
            onPageChange: options.onPageChange || function() {}
        };
        
        // 计算总页数
        this.totalPages = Math.ceil(this.config.totalItems / this.config.itemsPerPage);
        
        // 确保当前页码在有效范围内
        this.config.currentPage = Math.max(1, Math.min(this.config.currentPage, this.totalPages));
        
        // 分页容器元素
        this.container = null;
        this.picView = null;
    }

    setPicView(picView) {
        if(!(picView instanceof PicView)){
            throw new Error('picView 不是一个有效的 PicView 实例');
        }
        this.picView = picView;
        this.picView.setPagination(this);
    }

    _renderPicView() {
        if(!this.picView){
            return;
        }
        this.picView.render();
    }
    
    /**
     * 渲染分页控件到指定容器
     * @param {string|HTMLElement} container - 容器选择器或元素
     */
    render(container) {
        // 获取容器元素
        if (typeof container === 'string') {
            this.container = document.querySelector(container);
        } else {
            this.container = container;
        }
        
        if (!this.container) {
            console.error('分页容器元素未找到');
            return;
        }
        
        // 清空容器
        this.container.innerHTML = '';
        
        // 生成并添加分页HTML
        this.container.appendChild(this._createPaginationHTML());

        this._renderPicView();
        
        // 添加事件监听器
        this._addEventListeners();
    }
    
    /**
     * 创建分页HTML元素
     * @private
     */
    _createPaginationHTML() {
        const fragment = document.createDocumentFragment();
        const pagination = document.createElement('div');
        pagination.className = 'pagination';
        
        // 上一页按钮
        const prevButton = document.createElement('button');
        prevButton.className = `pagination-button ${this.config.currentPage === 1 ? 'disabled' : ''}`;
        prevButton.textContent = '<';
        prevButton.dataset.page = this.config.currentPage - 1;
        pagination.appendChild(prevButton);
        
        // 获取可见页码范围
        const visiblePages = this._getVisiblePages();
        
        // 首页按钮
        if (visiblePages[0] > 1) {
            const firstPageButton = document.createElement('button');
            firstPageButton.className = 'pagination-button';
            firstPageButton.textContent = '1';
            firstPageButton.dataset.page = 1;
            pagination.appendChild(firstPageButton);
            
            if (visiblePages[0] > 2) {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'pagination-ellipsis';
                ellipsis.textContent = '...';
                pagination.appendChild(ellipsis);
            }
        }
        
        // 可见页码按钮
        visiblePages.forEach(page => {
            const pageButton = document.createElement('button');
            pageButton.className = `pagination-button ${page === this.config.currentPage ? 'active' : ''}`;
            pageButton.textContent = page;
            pageButton.dataset.page = page;
            pagination.appendChild(pageButton);
        });
        
        // 尾页按钮
        if (visiblePages[visiblePages.length - 1] < this.totalPages) {
            if (visiblePages[visiblePages.length - 1] < this.totalPages - 1) {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'pagination-ellipsis';
                ellipsis.textContent = '...';
                pagination.appendChild(ellipsis);
            }
            
            const lastPageButton = document.createElement('button');
            lastPageButton.className = 'pagination-button';
            lastPageButton.textContent = this.totalPages;
            lastPageButton.dataset.page = this.totalPages;
            pagination.appendChild(lastPageButton);
        }
        
        // 下一页按钮
        const nextButton = document.createElement('button');
        nextButton.className = `pagination-button ${this.config.currentPage === this.totalPages ? 'disabled' : ''}`;
        nextButton.textContent = '>';
        nextButton.dataset.page = this.config.currentPage + 1;
        pagination.appendChild(nextButton);
        
        fragment.appendChild(pagination);
        return fragment;
    }
    
    /**
     * 获取可见页码范围
     * @private
     */
    _getVisiblePages() {
        let startPage, endPage;
        const halfPages = Math.floor(this.config.maxVisiblePages / 2);
        
        if (this.totalPages <= this.config.maxVisiblePages) {
            // 总页数少于或等于最大可见页数，显示所有页码
            startPage = 1;
            endPage = this.totalPages;
        } else if (this.config.currentPage <= halfPages + 1) {
            // 当前页靠前，显示前 maxVisiblePages 个页码
            startPage = 1;
            endPage = this.config.maxVisiblePages;
        } else if (this.config.currentPage >= this.totalPages - halfPages) {
            // 当前页靠后，显示后 maxVisiblePages 个页码
            startPage = this.totalPages - this.config.maxVisiblePages + 1;
            endPage = this.totalPages;
        } else {
            // 当前页在中间，显示以当前页为中心的 maxVisiblePages 个页码
            startPage = this.config.currentPage - halfPages;
            endPage = this.config.currentPage + halfPages;
        }
        
        return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
    }
    
    /**
     * 添加事件监听器
     * @private
     */
    _addEventListeners() {
        const buttons = this.container.querySelectorAll('.pagination-button:not(.disabled)');
        
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                const page = parseInt(e.target.dataset.page);
                this.setPage(page);
            });
        });
    }
    
    /**
     * 设置当前页码
     * @param {number} page - 页码
     */
    setPage(page) {
        // 确保页码在有效范围内
        if (page < 1 || page > this.totalPages) {
            return;
        }
        
        // 更新当前页码
        this.config.currentPage = page;
        
        // 重新渲染分页控件
        this.render(this.container);
        
        this.config.onPageChange(page);
    }
    
    /**
     * 获取当前页码
     * @returns {number} 当前页码
     */
    getCurrentPage() {
        return this.config.currentPage;
    }
    
    /**
     * 获取总页数
     * @returns {number} 总页数
     */
    getTotalPages() {
        return this.totalPages;
    }
    
    /**
     * 更新分页配置
     * @param {Object} options - 配置选项
     */
    update(options) {
        // 更新配置
        if (options.totalItems !== undefined) {
            this.config.totalItems = options.totalItems;
            this.totalPages = Math.ceil(this.config.totalItems / this.config.itemsPerPage);
        }
        
        if (options.itemsPerPage !== undefined) {
            this.config.itemsPerPage = options.itemsPerPage;
            this.totalPages = Math.ceil(this.config.totalItems / this.config.itemsPerPage);
        }
        
        if (options.currentPage !== undefined) {
            this.config.currentPage = Math.max(1, Math.min(options.currentPage, this.totalPages));
        }
        
        if (options.maxVisiblePages !== undefined) {
            this.config.maxVisiblePages = options.maxVisiblePages;
        }
        
        if (options.onPageChange !== undefined) {
            this.config.onPageChange = options.onPageChange;
        }
        
        // 重新渲染分页控件
        this.render(this.container);
    }
}

class PicView {
    constructor(options) {
        this.options = {
            container: options.container || '',
            dataJson: options.dataJson || [],
            picWith: options.picWith || 290,
            picHeight: options.picHeight || 200,
            columns: options.rows || 3,
            onDeleted: options.onDeleted || function() {}
        };
        
        if(!Array.isArray(this.options.dataJson)){
            alert('dataJson 不是数组');
        }
        this.pagination = null;
        this.container = null;
    }
    setPagination(pagination) {
        if(!(pagination instanceof Pagination)){
            alert('pagination 不是 Pagination 实例');
        }
        this.pagination = pagination;
    }
    render() {
        // 获取容器元素
        if (typeof this.options.container === 'string') {
            this.container = document.querySelector(this.options.container);
        } else {
            this.container = this.options.container;
        }
        
        if (!this.container) {
            console.error('图片展示容器元素未找到');
            return;
        }
        
        // 清空容器
        this.container.innerHTML = '';
        
        // 生成并添加分页HTML
        this.container.appendChild(this._createPicVeiwHTML());

        this._addEventListeners();
        
    }
    _createPicVeiwHTML() {
        const fragment = document.createDocumentFragment();
        const picView = document.createElement('div');
        picView.className = 'pic-view';
        picView.style = `display: grid; grid-template-columns: repeat(${this.options.columns}, 1fr); gap: 10px;justify-items: center;`;
        const startPage = (this.pagination.getCurrentPage() - 1) * this.pagination.config.itemsPerPage;
        const endPage = this.pagination.getCurrentPage() * this.pagination.config.itemsPerPage > this.options.dataJson.length ? this.options.dataJson.length : this.pagination.getCurrentPage() * this.pagination.config.itemsPerPage;
        for (let i = startPage; i < endPage; i++) {
            const detail = document.createElement('div');
            detail.className = 'pic-view-detail';
            detail.style = `text-align: left;width: ${this.options.picWith}px;`;
            const pic = document.createElement('img');
            pic.src = this.options.dataJson[i].picUrl;
            pic.style = `
                width: ${this.options.picWith}px;
                height: ${this.options.picHeight}px;`;
            const overlay = document.createElement('div');
            overlay.className = 'overlay';
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'pic-view-detail-btn';
            deleteBtn.textContent = '删除';
            deleteBtn.dataset.picName = this.options.dataJson[i].picName;
            overlay.appendChild(deleteBtn);
            const picName = document.createElement('div');
            picName.textContent = this.options.dataJson[i].picName;
            picName.style = `
                overflow: hidden; text-overflow: ellipsis; white-space: nowrap; 
                height: 20px; 
                width: ${this.options.picWith}px; 
                font-size: smaller;`
            detail.appendChild(pic);
            detail.appendChild(overlay);
            detail.appendChild(picName);
            picView.appendChild(detail);
        }
        fragment.appendChild(picView);
        return fragment;
    }
    _addEventListeners() {
        const buttons = this.container.querySelectorAll('.pic-view-detail-btn');
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                const picName = e.target.dataset.picName;
                this.options.onDeleted(picName);
                this.options.dataJson = this.options.dataJson.filter(item => item.picName !== picName);
                this.render();
                if(this.pagination){
                    this.pagination.update({
                        totalItems: this.options.dataJson.length
                    });
                }
            });
        });

        const pics = this.container.querySelectorAll('.pic-view-detail>img');
        pics.forEach(pic => {
            pic.addEventListener('click', (e) => {
                const overlayFullscreen = document.createElement('div');
                overlayFullscreen.className = 'overlay-fullscreen';
                const img = document.createElement('img');
                img.src = e.target.src;
                overlayFullscreen.appendChild(img);
                document.body.appendChild(overlayFullscreen);
                overlayFullscreen.addEventListener('click', () => {
                    document.body.removeChild(overlayFullscreen);
                });
            })
        })
    }
}

// 添加简单的CSS样式
(function() {
    const style = document.createElement('style');
    style.textContent = `
        .pagination {
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 1rem 0;
            gap: 0.25rem;
        }
        
        .pagination-button {
            padding: 0.5rem 1rem;
            border: 1px solid #ddd;
            background-color: #fff;
            color: #333;
            cursor: pointer;
            border-radius: 0.25rem;
            transition: background-color 0.2s;
        }
        
        .pagination-button:hover:not(.disabled):not(.active) {
            background-color: #f5f5f5;
        }
        
        .pagination-button.active {
            background-color: #007bff;
            color: white;
            border-color: #007bff;
        }
        
        .pagination-button.disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        .pagination-ellipsis {
            padding: 0.5rem;
        }

        .pic-view-detail {
            position: relative;
            display: inline-block;
        }
        
        .pic-view-detail img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .pic-view-detail .caption {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            height: 20px;
            width: 100%;
            font-size: smaller;
        }
        
        .pic-view-detail .overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 30px;
            background-color: rgba(0, 0, 0, 0.6);
            display: none;
            align-items: flex-end;
            justify-content: flex-end;
        }
        
        .pic-view-detail:hover .overlay {
            display: flex;
        }
        
        .pic-view-detail .overlay .pic-view-detail-btn {
            background-color: #ff4d4f;
            color: white;
            border: none;
            padding: 2px 8px;
            margin: 5px;
            border-radius: 2px;
            cursor: pointer;
            font-size: 12px;
        }
        
        .pic-view-detail .overlay .pic-view-detail-btn:hover {
            background-color: #ff7875;
        }

        /* 全屏遮盖样式 */
        .overlay-fullscreen {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 3000;
            cursor: pointer;
        }
        
        .overlay-fullscreen img {
            max-width: 90%;
            max-height: 90%;
            object-fit: contain;
            cursor: default;
        }
        
        .overlay-content {
            position: relative;
            cursor: default;
        }
    `;
    document.head.appendChild(style);
})();    