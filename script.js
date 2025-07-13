
// Pretty Manor 视频播放器控制
let currentVideoIndex = 0;
let videoSlides, indicators;
let autoPlayInterval;

// 初始化视频播放器
function initVideoPlayer() {
    videoSlides = document.querySelectorAll('.video-slide');
    indicators = document.querySelectorAll('.indicator');
    
    if (videoSlides.length === 0) return;
    
    // 为所有视频添加事件监听器
    videoSlides.forEach((slide, index) => {
        const video = slide.querySelector('video');
        if (video) {
            // 预设视频属性
            video.muted = true;
            video.loop = true;
            video.playsInline = true; // 移动端内联播放
            
            // 当视频可以播放时的处理
            video.addEventListener('canplay', () => {
                if (index === 0) {
                    // 只在第一个视频时尝试自动播放
                    video.play().catch(() => {
                        // 静默处理失败
                    });
                }
            });
            
            // 鼠标悬停时暂停自动播放
            slide.addEventListener('mouseenter', stopAutoPlay);
            slide.addEventListener('mouseleave', startAutoPlay);
            
            // 点击视频时播放/暂停
            video.addEventListener('click', () => {
                if (video.paused) {
                    video.play();
                } else {
                    video.pause();
                }
            });
        }
    });
    
    // 设置第一个视频为活动状态
    showVideo(0);
    
    // 开始自动播放轮播
    startAutoPlay();
}

// 显示指定索引的视频
function showVideo(index) {
    // 隐藏所有视频
    videoSlides.forEach((slide, i) => {
        slide.classList.remove('active');
        const video = slide.querySelector('video');
        if (video && i !== index) {
            video.pause();
        }
    });
    
    // 更新指示器
    indicators.forEach((indicator, i) => {
        indicator.classList.toggle('active', i === index);
    });
    
    // 显示当前视频
    if (videoSlides[index]) {
        videoSlides[index].classList.add('active');
        const currentVideo = videoSlides[index].querySelector('video');
        if (currentVideo) {
            currentVideo.currentTime = 0;
            // 改进视频播放逻辑，减少控制台错误
            const playPromise = currentVideo.play();
            if (playPromise !== undefined) {
                playPromise.catch(e => {
                    // 静默处理自动播放限制，不在控制台输出错误
                    currentVideo.muted = true;
                    currentVideo.play().catch(() => {
                        // 如果仍然失败，则等待用户交互
                    });
                });
            }
        }
    }
    
    currentVideoIndex = index;
}

// 切换到下一个/上一个视频
function changeVideo(direction) {
    stopAutoPlay();
    
    if (direction > 0) {
        currentVideoIndex = (currentVideoIndex + 1) % videoSlides.length;
    } else {
        currentVideoIndex = (currentVideoIndex - 1 + videoSlides.length) % videoSlides.length;
    }
    
    showVideo(currentVideoIndex);
    startAutoPlay();
}

// 跳转到指定视频
function currentVideo(index) {
    stopAutoPlay();
    showVideo(index - 1); // 函数传入的是1-based索引
    startAutoPlay();
}

// 开始自动播放
function startAutoPlay() {
    stopAutoPlay(); // 先清除现有的定时器
    autoPlayInterval = setInterval(() => {
        currentVideoIndex = (currentVideoIndex + 1) % videoSlides.length;
        showVideo(currentVideoIndex);
    }, 6000); // 每6秒切换一次
}

// 停止自动播放
function stopAutoPlay() {
    if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
    }
}

// 简洁的视觉效果
function initHeroAnimation() {
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        let ticking = false;
        
        // 添加平滑的视差滚动效果，使用requestAnimationFrame优化性能
        function updateParallax() {
            const scrolled = window.pageYOffset;
            const parallax = document.querySelector('.hero');
            const speed = scrolled * 0.3; // 减少视差强度
            
            if (parallax && scrolled < window.innerHeight) {
                parallax.style.transform = `translateY(${speed}px)`;
            }
            ticking = false;
        }
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        });
    }
}

// 当页面加载完成时初始化
document.addEventListener('DOMContentLoaded', function() {
    const navbar = document.querySelector('.navbar');
    const sections = document.querySelectorAll('.content-section, .hero');
    const navLinks = document.querySelectorAll('.nav-links a');
    const scrollToTopBtn = document.getElementById('scroll-to-top');
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const navMenu = document.querySelector('.nav-links');

    // 初始化英雄区动画
    initHeroAnimation();
    
    // 初始化视频播放器
    initVideoPlayer();

    // 视频导航事件监听器
    const videoPrevBtn = document.getElementById('video-prev-btn');
    const videoNextBtn = document.getElementById('video-next-btn');

    if (videoPrevBtn) {
        videoPrevBtn.addEventListener('click', () => changeVideo(-1));
    }
    if (videoNextBtn) {
        videoNextBtn.addEventListener('click', () => changeVideo(1));
    }
    
    // 修复指示器选择器和事件绑定
    const videoIndicators = document.querySelectorAll('.indicator');
    videoIndicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            stopAutoPlay();
            showVideo(index);
            startAutoPlay();
        });
    });

    // --- 汉堡菜单点击事件 ---
    if (hamburgerMenu) {
        hamburgerMenu.addEventListener('click', () => {
            hamburgerMenu.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.classList.toggle('nav-open');
        });
    }

    // --- 点击移动端导航链接后关闭菜单 ---
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (document.body.classList.contains('nav-open')) {
                hamburgerMenu.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.classList.remove('nav-open');
            }
        });
    });

    // --- 导航栏滚动效果 & 返回顶部按钮 ---
    let scrollTicking = false;
    
    function updateNavbar() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
            if (scrollToTopBtn) scrollToTopBtn.classList.add('visible');
        } else {
            navbar.classList.remove('scrolled');
            if (scrollToTopBtn) scrollToTopBtn.classList.remove('visible');
        }
        scrollTicking = false;
    }
    
    window.addEventListener('scroll', () => {
        if (!scrollTicking) {
            requestAnimationFrame(updateNavbar);
            scrollTicking = true;
        }
    });

    // --- 返回顶部按钮点击事件 ---
    if (scrollToTopBtn) {
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- 内容区域淡入 & 导航链接高亮 ---
    const observerOptions = { rootMargin: '-50% 0px -50% 0px' };
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const id = entry.target.getAttribute('id');
            const navLink = document.querySelector(`.nav-links a[data-section="${id}"]`);
            
            // 内容淡入
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // 导航高亮
                if (navLink) {
                    navLinks.forEach(link => link.classList.remove('active'));
                    navLink.classList.add('active');
                }
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        if (section) sectionObserver.observe(section);
    });

    // --- 医生卡片翻转逻辑 ---
    document.querySelectorAll('.artisan-card').forEach(card => {
        card.addEventListener('click', () => { 
            card.classList.toggle('is-flipped'); 
        });
    });

    // --- 客户心声轮播逻辑 ---
    const slidesContainer = document.querySelector('.testimonial-slides');
    if (slidesContainer) {
        const slides = slidesContainer.children;
        const prevBtn = document.getElementById('prev-slide');
        const nextBtn = document.getElementById('next-slide');
        let currentIndex = 0;
        const totalSlides = slides.length;

        function updateSlidePosition() {
            slidesContainer.style.transform = `translateX(-${currentIndex * 100}%)`;
        }

        if (prevBtn && nextBtn && totalSlides > 0) {
            nextBtn.addEventListener('click', () => {
                currentIndex = (currentIndex + 1) % totalSlides;
                updateSlidePosition();
            });
            prevBtn.addEventListener('click', () => {
                currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
                updateSlidePosition();
            });
        }
    }

    // --- FAQ手风琴逻辑 ---
    document.querySelectorAll('.faq-question').forEach(button => {
        button.addEventListener('click', () => {
            const answerWrapper = button.nextElementSibling;
            button.classList.toggle('active');
            if (button.classList.contains('active')) {
                answerWrapper.style.maxHeight = answerWrapper.scrollHeight + 'px';
            } else {
                answerWrapper.style.maxHeight = '0';
            }
        });
    });

    // --- 预约弹窗逻辑 ---
    const modalOverlay = document.getElementById('contact-modal');
    const openModalBtn = document.getElementById('open-modal-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');

    const openModal = () => { 
        if(modalOverlay) { 
            modalOverlay.classList.add('active'); 
            document.body.classList.add('modal-open'); 
        }
    };
    const closeModal = () => { 
        if(modalOverlay) { 
            modalOverlay.classList.remove('active'); 
            document.body.classList.remove('modal-open'); 
        }
    };

    if (openModalBtn) openModalBtn.addEventListener('click', openModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (event) => { 
            if (event.target === modalOverlay) closeModal(); 
        });
    }
});

// 页面卸载时清理定时器
window.addEventListener('beforeunload', () => {
    stopAutoPlay();
});
