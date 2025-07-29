// Fonctionnalités de base
document.addEventListener('DOMContentLoaded', function() {
    // Menu mobile
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    mobileMenuButton.addEventListener('click', function() {
        mobileMenu.classList.toggle('hidden');
        this.setAttribute('aria-expanded', mobileMenu.classList.contains('hidden') ? 'false' : 'true');
    });
    
    // Fermer le menu quand on clique à l'extérieur
    document.addEventListener('click', function(e) {
        if (!mobileMenu.contains(e.target) && !mobileMenuButton.contains(e.target)) {
            mobileMenu.classList.add('hidden');
            mobileMenuButton.setAttribute('aria-expanded', 'false');
        }
    });
    
    // Smooth scrolling pour les liens d'ancrage
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Fermer le menu mobile si ouvert
                if (!mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                    mobileMenuButton.setAttribute('aria-expanded', 'false');
                }
                
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Bouton retour en haut
    const backToTopButton = document.getElementById('back-to-top');
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopButton.classList.remove('opacity-0', 'invisible');
            backToTopButton.classList.add('opacity-100', 'visible');
        } else {
            backToTopButton.classList.remove('opacity-100', 'visible');
            backToTopButton.classList.add('opacity-0', 'invisible');
        }
    });
    
    backToTopButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Animation au scroll
    function animateOnScroll() {
        const elements = document.querySelectorAll('.animate-fade-in');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.3;
            
            if (elementPosition < screenPosition) {
                element.classList.add('opacity-100');
            }
        });
    }
    
    // État initial
    document.querySelectorAll('.animate-fade-in').forEach(el => {
        el.classList.add('opacity-0');
    });
    
    // Démarrer aux événements load et scroll
    window.addEventListener('load', animateOnScroll);
    window.addEventListener('scroll', animateOnScroll);
    
    // Chargement paresseux des images
    const lazyLoad = () => {
        const lazyImages = document.querySelectorAll('img.lazy-load');
        const lazyIframes = document.querySelectorAll('iframe.lazy-load');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    
                    if (element.tagName === 'IMG') {
                        element.src = element.dataset.src;
                    } else if (element.tagName === 'IFRAME') {
                        element.src = element.dataset.src;
                    }
                    
                    element.classList.remove('lazy-load');
                    observer.unobserve(element);
                }
            });
        });
        
        lazyImages.forEach(img => observer.observe(img));
        lazyIframes.forEach(iframe => observer.observe(iframe));
    };
    
    lazyLoad();
    
    // Animation des compteurs
    function animateCounters() {
        const counters = document.querySelectorAll('.counter');
        const speed = 200;
        
        counters.forEach(counter => {
            const target = +counter.getAttribute('data-target');
            const count = +counter.innerText;
            const increment = target / speed;
            
            if (count < target) {
                counter.innerText = Math.min(Math.ceil(count + increment), target);
                setTimeout(animateCounters, 1);
            } else {
                counter.innerText = target;
            }
        });
    }
    
    // Démarrer l'animation des compteurs quand la section est visible
    new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            animateCounters();
        }
    }).observe(document.getElementById('stats'));
    
    // Gestion du panier
    const cart = {
        items: JSON.parse(localStorage.getItem('cartItems')) || [],
        total: 0,
        
        calculateTotal() {
            this.total = this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        },
        
        save() {
            localStorage.setItem('cartItems', JSON.stringify(this.items));
        },
        
        addItem(product) {
            const existingItem = this.items.find(item => item.id === product.id);
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                this.items.push({
                    ...product,
                    quantity: 1
                });
            }
            
            this.calculateTotal();
            this.save();
            this.updateUI();
            this.showNotification(product.name);
        },
        
        removeItem(productId) {
            const index = this.items.findIndex(item => item.id === productId);
            if (index !== -1) {
                this.items.splice(index, 1);
                this.calculateTotal();
                this.save();
                this.updateUI();
            }
        },
        
        changeQuantity(productId, quantity) {
            const item = this.items.find(item => item.id === productId);
            if (item) {
                item.quantity = quantity;
                if (item.quantity <= 0) {
                    this.removeItem(productId);
                } else {
                    this.calculateTotal();
                    this.save();
                    this.updateUI();
                }
            }
        },
        
        updateUI() {
            // Mettre à jour le compteur
            const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
            
            const cartCountElem = document.getElementById('cart-count');
            const mobileCartCountElem = document.getElementById('mobile-cart-count');
            if (cartCountElem) cartCountElem.textContent = totalItems;
            if (mobileCartCountElem) mobileCartCountElem.textContent = totalItems;
            
            if (totalItems > 0) {
                if (cartCountElem) cartCountElem.classList.remove('hidden');
                if (mobileCartCountElem) mobileCartCountElem.classList.remove('hidden');
            } else {
                if (cartCountElem) cartCountElem.classList.add('hidden');
                if (mobileCartCountElem) mobileCartCountElem.classList.add('hidden');
            }
            
            // Mettre à jour le dropdown du panier
            const cartItemsElement = document.getElementById('cart-items');
            const cartTotalElement = document.getElementById('cart-total');
            const checkoutBtn = document.getElementById('checkout-btn');
            
            if (this.items.length > 0) {
                cartItemsElement.innerHTML = this.items.map(item => `
                    <div class="flex justify-between items-center py-3 border-b">
                        <div>
                            <h4 class="font-medium">${item.name}</h4>
                            <p class="text-sm text-gray-600">${item.price} FCFA x 
                                <input type="number" min="1" value="${item.quantity}" data-id="${item.id}" class="quantity-input w-16 text-center border rounded" />
                            </p>
                        </div>
                        <span class="font-medium">${item.price * item.quantity} FCFA</span>
                        <button class="text-red-600 hover:text-red-800 ml-4" aria-label="Supprimer ${item.name}" data-id="${item.id}">&times;</button>
                    </div>
                `).join('');
                
                cartTotalElement.innerHTML = `Total: <span class="float-right">${this.total} FCFA</span>`;
                cartTotalElement.classList.remove('hidden');
                checkoutBtn.classList.remove('hidden');
            } else {
                cartItemsElement.innerHTML = '<p class="text-gray-500 text-center py-4">Votre panier est vide</p>';
                cartTotalElement.classList.add('hidden');
                checkoutBtn.classList.add('hidden');
            }
            
            // Ajouter les écouteurs pour les boutons supprimer et les inputs quantité
            document.querySelectorAll('#cart-items button').forEach(button => {
                button.addEventListener('click', (e) => {
                    const id = e.target.getAttribute('data-id');
                    cart.removeItem(id);
                });
            });
            
            document.querySelectorAll('.quantity-input').forEach(input => {
                input.addEventListener('change', (e) => {
                    const id = e.target.getAttribute('data-id');
                    let quantity = parseInt(e.target.value);
                    if (isNaN(quantity) || quantity < 1) {
                        quantity = 1;
                        e.target.value = 1;
                    }
                    cart.changeQuantity(id, quantity);
                });
            });
        },
        
        showNotification(productName) {
            const notification = document.createElement('div');
            notification.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-emerald-600 text-white px-6 py-3 rounded-md shadow-lg flex items-center transition-opacity duration-300';
            notification.innerHTML = `
                <i class="fas fa-check-circle mr-2"></i>
                ${productName} ajouté au panier
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.classList.add('opacity-0', 'translate-y-4');
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }
    };
    
    // Écouteurs pour les boutons "Ajouter au panier"
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const product = JSON.parse(this.dataset.product);
            cart.addItem(product);
        });
    });
    
    // Gestion du panier mobile
    document.getElementById('mobile-cart-btn').addEventListener('click', function() {
        mobileMenu.classList.add('hidden');
        document.getElementById('cart-dropdown').classList.toggle('hidden');
    });
    
    // Gestion du panier desktop
    document.getElementById('cart-button').addEventListener('click', function(e) {
        e.stopPropagation();
        document.getElementById('cart-dropdown').classList.toggle('hidden');
    });
    
    // Fermer le panier quand on clique ailleurs
    document.addEventListener('click', function(e) {
        if (!document.getElementById('cart-button').contains(e.target) && 
            !document.getElementById('cart-dropdown').contains(e.target)) {
            document.getElementById('cart-dropdown').classList.add('hidden');
        }
    });
    
    // Bouton de commande
    document.getElementById('checkout-btn').addEventListener('click', function() {
        alert('Fonctionnalité de commande en développement. Merci de nous contacter directement.');
    });
    
    // Gestion des cookies
    if (!localStorage.getItem('cookiesAccepted')) {
        document.getElementById('cookie-banner').classList.remove('hidden');
    }
    
    document.getElementById('accept-cookies').addEventListener('click', function() {
        localStorage.setItem('cookiesAccepted', 'true');
        document.getElementById('cookie-banner').classList.add('hidden');
    });
    
    document.getElementById('reject-cookies').addEventListener('click', function() {
        // Implémenter ici le rejet des cookies
        document.getElementById('cookie-banner').classList.add('hidden');
    });
    
    // Simulation de données pour le monitoring
    function updateMonitoringData() {
        const temp = 22 + Math.random() * 6;
        const humidity = 60 + Math.random() * 20;
        const light = 500 + Math.random() * 600;
        
        document.getElementById('temp-value').textContent = Math.round(temp) + '°C';
        document.getElementById('humidity-value').textContent = Math.round(humidity) + '%';
        document.getElementById('light-value').textContent = Math.round(light) + ' lux';
        
        // Mettre à jour les barres de progression
        document.querySelector('#temp-value').previousElementSibling.querySelector('div').style.width = `${(temp - 20) / 10 * 100}%`;
        document.querySelector('#humidity-value').previousElementSibling.querySelector('div').style.width = `${humidity}%`;
        document.querySelector('#light-value').previousElementSibling.querySelector('div').style.width = `${(light - 300) / 900 * 100}%`;
    }
    
    setInterval(updateMonitoringData, 3000);
    updateMonitoringData();
    
    // Gestion du formulaire de contact
    document.getElementById('contact-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Ici, vous ajouteriez normalement l'envoi AJAX
        alert('Merci pour votre message! Nous vous contacterons bientôt.');
        this.reset();
    });
    
    // Gestion de la newsletter
    document.getElementById('newsletter-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = this.querySelector('input[type="email"]').value;
        // Ici, vous ajouteriez normalement l'envoi AJAX
        alert(`Merci pour votre inscription à notre newsletter (${email}) !`);
        this.reset();
    });
    
    // Lightbox pour la galerie
    document.querySelectorAll('.gallery img').forEach(img => {
        img.addEventListener('click', function() {
            const lightbox = document.createElement('div');
            lightbox.className = 'fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4';
            lightbox.innerHTML = `
                <div class="relative max-w-4xl w-full">
                    <img src="${this.src}" alt="${this.alt}" class="max-w-full max-h-screen mx-auto" style="object-fit: contain;">
                    <button class="absolute top-4 right-4 text-white text-4xl hover:text-emerald-400 transition">&times;</button>
                </div>
            `;
            document.body.appendChild(lightbox);
            
            lightbox.querySelector('button').addEventListener('click', () => {
                lightbox.classList.add('opacity-0');
                setTimeout(() => lightbox.remove(), 300);
            });
        });
    });
    
    // Optimisation de la vidéo hero
    const heroVideo = document.getElementById('hero-video');
    if (heroVideo) {
        heroVideo.playbackRate = 0.7;
        heroVideo.preload = "auto";
        heroVideo.playsInline = true;
        heroVideo.muted = true;
    }
    
    // Gestion des FAQ
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', function() {
            const faqItem = this.closest('.faq-item');
            const answer = faqItem.querySelector('.faq-answer');
            const icon = this.querySelector('i');
            
            // Fermer toutes les autres réponses
            document.querySelectorAll('.faq-answer').forEach(ans => {
                if (ans !== answer) {
                    ans.classList.add('hidden');
                    ans.previousElementSibling.querySelector('i').classList.remove('fa-chevron-up');
                    ans.previousElementSibling.querySelector('i').classList.add('fa-chevron-down');
                }
            });
            
            // Basculer la réponse actuelle
            answer.classList.toggle('hidden');
            icon.classList.toggle('fa-chevron-down');
            icon.classList.toggle('fa-chevron-up');
        });
    });
    
    // Gestion de la sous-navigation À Propos
    const subnavLinks = document.querySelectorAll('.subnav-link');
    const subnavSections = ['a-propos', 'notre-difference', 'partenaires', 'faq', 'medias'];
    
    function updateSubnav() {
        let currentSection = '';
        
        // Trouver la section actuellement visible
        subnavSections.forEach(section => {
            const element = document.getElementById(section);
            if (element) {
                const rect = element.getBoundingClientRect();
                if (rect.top <= 100 && rect.bottom >= 100) {
                    currentSection = section;
                }
            }
        });
        
        // Mettre à jour les liens actifs
        subnavLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }
    
    window.addEventListener('scroll', updateSubnav);
    window.addEventListener('load', updateSubnav);
});
