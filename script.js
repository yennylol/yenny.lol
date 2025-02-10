document.addEventListener('DOMContentLoaded', () => {
    // Initialize particles.js if the element exists
    const particlesEl = document.getElementById('particles-js');
    if (particlesEl) {
        particlesJS('particles-js', {
            particles: {
                number: {
                    value: 50,
                    density: {
                        enable: true,
                        value_area: 800
                    }
                },
                color: {
                    value: '#ffffff'
                },
                shape: {
                    type: 'circle'
                },
                opacity: {
                    value: 0.2,
                    random: false
                },
                size: {
                    value: 3,
                    random: true
                },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: '#ffffff',
                    opacity: 0.1,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 2,
                    direction: 'none',
                    random: false,
                    straight: false,
                    out_mode: 'out',
                    bounce: false
                }
            },
            interactivity: {
                detect_on: 'canvas',
                events: {
                    onhover: {
                        enable: true,
                        mode: 'grab'
                    },
                    resize: true
                },
                modes: {
                    grab: {
                        distance: 140,
                        line_linked: {
                            opacity: 0.3
                        }
                    }
                }
            }
        });
    }

    // Create and add custom cursor
    const customCursor = document.createElement('div');
    customCursor.classList.add('custom-cursor', 'default');
    document.body.appendChild(customCursor);

    let cursorTimeout;
    document.addEventListener('mousemove', (e) => {
        if (!customCursor) return;
        
        if (cursorTimeout) {
            clearTimeout(cursorTimeout);
        }
        
        customCursor.style.opacity = '1';
        customCursor.style.left = `${e.clientX}px`;
        customCursor.style.top = `${e.clientY}px`;
        
        cursorTimeout = setTimeout(() => {
            customCursor.style.opacity = '0';
        }, 2000);
    });

    // Safely get elements
    const getElement = (id) => document.getElementById(id);
    const elements = {
        fileInputs: document.querySelectorAll('.file-input'),
        badgeInput: getElement('badge-input'),
        badgePreview: getElement('badge-preview'),
        usernameInput: getElement('username'),
        profilePicInput: getElement('profile-pic'),
        cursorImageInput: getElement('cursor-image'),
        backgroundMusicInput: getElement('background-music'),
        backgroundVideoInput: getElement('background-video'),
        makeProfileButton: getElement('make-profile'),
        opacitySlider: getElement('opacity-slider'),
        blurSlider: getElement('blur-slider'),
        opacityValue: getElement('opacity-value'),
        blurValue: getElement('blur-value'),
        boxColorPicker: getElement('box-color'),
        boxColorValue: getElement('box-color-value'),
        boxGlowToggle: getElement('box-glow'),
        usernameGlowToggle: getElement('username-glow'),
        badgesGlowToggle: getElement('badges-glow'),
        descriptionInput: getElement('description'),
        backgroundEffect: getElement('background-effect')
    };

    // Initialize badges array
    let badges = [];
    let audio;

    // Update file input labels
    if (elements.fileInputs) {
        elements.fileInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                const fileName = e.target.files[0]?.name || '';
                const button = e.target.previousElementSibling;
                if (button) {
                    const icon = button.querySelector('i');
                    if (fileName) {
                        button.textContent = fileName;
                        if (icon) button.prepend(icon);
                    }
                }
            });
        });
    }

    // Badge handling
    if (elements.badgeInput && elements.badgePreview) {
        elements.badgeInput.addEventListener('change', (e) => {
            const files = e.target.files;
            for (let file of files) {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        badges.push({
                            src: e.target.result,
                            file: file
                        });
                        updateBadgePreview();
                    };
                    reader.readAsDataURL(file);
                }
            }
        });
    }

    function updateBadgePreview() {
        if (!elements.badgePreview) return;
        elements.badgePreview.innerHTML = '';
        badges.forEach((badge, index) => {
            const badgeElement = document.createElement('div');
            badgeElement.classList.add('badge-preview-item');
            
            const img = document.createElement('img');
            img.src = badge.src;
            img.alt = `Badge ${index + 1}`;
            
            const removeBtn = document.createElement('button');
            removeBtn.innerHTML = '×';
            removeBtn.classList.add('remove-badge');
            removeBtn.onclick = () => {
                badges.splice(index, 1);
                updateBadgePreview();
            };
            
            badgeElement.appendChild(img);
            badgeElement.appendChild(removeBtn);
            elements.badgePreview.appendChild(badgeElement);
        });
    }

    // Opacity and blur sliders
    let currentOpacity = 0.4;
    let currentBlur = 10;

    if (elements.opacitySlider) {
        elements.opacitySlider.addEventListener('input', (e) => {
            currentOpacity = e.target.value / 100;
            if (elements.opacityValue) {
                elements.opacityValue.textContent = currentOpacity.toFixed(2);
            }
        });
    }

    if (elements.blurSlider) {
        elements.blurSlider.addEventListener('input', (e) => {
            currentBlur = e.target.value;
            if (elements.blurValue) {
                elements.blurValue.textContent = `${currentBlur}px`;
            }
        });
    }

    // Color picker
    if (elements.boxColorPicker) {
        elements.boxColorPicker.addEventListener('input', (e) => {
            if (elements.boxColorValue) {
                elements.boxColorValue.textContent = e.target.value;
            }
        });
    }

    // Glow toggles
    const glowToggles = [elements.boxGlowToggle, elements.usernameGlowToggle, elements.badgesGlowToggle];

    // Update cursor image
    function updateCursor(cursorImage) {
        if (cursorImage) {
            const cursorUrl = URL.createObjectURL(cursorImage);
            customCursor.style.backgroundImage = `url(${cursorUrl})`;
            customCursor.style.backgroundSize = 'contain';
            customCursor.style.backgroundPosition = 'center';
            customCursor.style.backgroundRepeat = 'no-repeat';
            customCursor.classList.remove('default');
        } else {
            customCursor.style.backgroundImage = 'none';
            customCursor.classList.add('default');
        }
    }

    // Create volume control
    function createVolumeControl() {
        const volumeControl = document.createElement('div');
        volumeControl.classList.add('volume-control');

        // Volume icon
        const volumeIcon = document.createElement('i');
        volumeIcon.classList.add('volume-icon', 'fas', 'fa-volume-up');
        
        // Volume slider
        const volumeSlider = document.createElement('input');
        volumeSlider.type = 'range';
        volumeSlider.min = '0';
        volumeSlider.max = '100';
        volumeSlider.value = '50';
        volumeSlider.classList.add('volume-slider');

        volumeSlider.addEventListener('input', () => {
            if (audio) {
                const volume = volumeSlider.value / 100;
                audio.volume = volume;
                
                // Update icon based on volume level
                if (volume === 0) {
                    volumeIcon.className = 'volume-icon fas fa-volume-mute';
                } else if (volume < 0.5) {
                    volumeIcon.className = 'volume-icon fas fa-volume-down';
                } else {
                    volumeIcon.className = 'volume-icon fas fa-volume-up';
                }
            }
        });

        volumeIcon.addEventListener('click', () => {
            if (audio) {
                if (audio.volume > 0) {
                    audio.volume = 0;
                    volumeSlider.value = 0;
                    volumeIcon.className = 'volume-icon fas fa-volume-mute';
                } else {
                    audio.volume = 0.5;
                    volumeSlider.value = 50;
                    volumeIcon.className = 'volume-icon fas fa-volume-up';
                }
            }
        });

        volumeControl.appendChild(volumeIcon);
        volumeControl.appendChild(volumeSlider);
        return volumeControl;
    }

    // Make profile button
    if (elements.makeProfileButton) {
        elements.makeProfileButton.addEventListener('click', () => {
            const username = elements.usernameInput?.value.trim() || '';
            const description = elements.descriptionInput?.value || '';
            const profilePic = elements.profilePicInput?.files[0];
            const cursorImage = elements.cursorImageInput?.files[0];
            const backgroundMusic = elements.backgroundMusicInput?.files[0];
            const backgroundVideo = elements.backgroundVideoInput?.files[0];

            let errors = [];
            
            if (!username) {
                errors.push("Username is required");
            }
            
            if (!profilePic) {
                errors.push("Profile picture is required");
            }
            
            if (!backgroundMusic) {
                errors.push("Background music is required");
            }
            
            if (!backgroundVideo) {
                errors.push("Background video is required");
            }

            if (errors.length > 0) {
                alert('Please fix the following:\n\n' + errors.join('\n'));
                return;
            }

            // Create Profile Page
            const profilePage = document.createElement('div');
            profilePage.classList.add('profile-page');

            // Animated Background Gradient
            const animatedBackground = document.createElement('div');
            animatedBackground.classList.add('animated-background');
            profilePage.appendChild(animatedBackground);

            // Background Video
            const backgroundVideoElement = document.createElement('video');
            backgroundVideoElement.classList.add('background-video');
            backgroundVideoElement.src = URL.createObjectURL(backgroundVideo);
            backgroundVideoElement.autoplay = true;
            backgroundVideoElement.loop = true;
            backgroundVideoElement.muted = true;
            profilePage.appendChild(backgroundVideoElement);

            const profileContent = document.createElement('div');
            profileContent.classList.add('profile-content');
            profileContent.style.setProperty('--content-opacity', currentOpacity);
            profileContent.style.setProperty('--content-blur', `${currentBlur}px`);
            
            // Apply custom background color
            const backgroundColor = elements.boxColorPicker?.value || '';
            profileContent.style.background = `${backgroundColor}${Math.round(currentOpacity * 255).toString(16).padStart(2, '0')}`;
            
            // Apply box glow if enabled
            if (elements.boxGlowToggle?.checked) {
                profileContent.style.boxShadow = `0 8px 32px rgba(255, 255, 255, 0.2), 0 0 20px rgba(255, 255, 255, 0.1)`;
            }

            const profilePicElement = document.createElement('img');
            profilePicElement.classList.add('profile-pic');
            profilePicElement.src = URL.createObjectURL(profilePic);
            profileContent.appendChild(profilePicElement);

            const usernameElement = document.createElement('div');
            usernameElement.classList.add('username');
            if (elements.usernameGlowToggle?.checked) {
                usernameElement.classList.add('glow');
            }
            usernameElement.textContent = username;
            profileContent.appendChild(usernameElement);

            // Add badges with glow if enabled
            if (badges.length > 0) {
                const badgesContainer = document.createElement('div');
                badgesContainer.classList.add('user-badges');
                badges.forEach(badge => {
                    const badgeElement = document.createElement('div');
                    badgeElement.classList.add('badge');
                    if (elements.badgesGlowToggle?.checked) {
                        badgeElement.classList.add('glow');
                    }
                    const badgeImg = document.createElement('img');
                    badgeImg.src = badge.src;
                    badgeImg.alt = 'User Badge';
                    badgeElement.appendChild(badgeImg);
                    badgesContainer.appendChild(badgeElement);
                });
                profileContent.appendChild(badgesContainer);
            }

            // Add description after badges
            if (description) {
                const descriptionElement = document.createElement('div');
                descriptionElement.classList.add('user-description');
                descriptionElement.textContent = description;
                profileContent.appendChild(descriptionElement);
            }

            let socialLinks = [];
            let userSettings = {
                socialLinks: [],
                usernameEffect: 'none',
                effectColor: '#00ff00'
            };

            // Add social icons
            if (socialLinks.length > 0) {
                const socialIcons = document.createElement('div');
                socialIcons.className = 'social-icons';
                socialLinks.forEach(link => {
                    const linkElement = document.createElement('a');
                    linkElement.href = link.url;
                    linkElement.target = '_blank';
                    const iconImg = document.createElement('img');
                    iconImg.src = link.iconUrl;
                    iconImg.alt = 'Social Icon';
                    iconImg.style.width = '24px';
                    iconImg.style.height = '24px';
                    linkElement.appendChild(iconImg);
                    socialIcons.appendChild(linkElement);
                });
                profileContent.appendChild(socialIcons);
            }

            profilePage.appendChild(profileContent);

            // Audio setup
            audio = new Audio(URL.createObjectURL(backgroundMusic));
            audio.loop = true;
            audio.volume = 0.5;

            // Volume control
            const volumeControl = createVolumeControl();
            profilePage.appendChild(volumeControl);
            
            // Update cursor if custom image was provided
            if (cursorImage) {
                updateCursor(cursorImage);
            }

            // Replace current page content
            document.body.innerHTML = '';
            document.body.appendChild(profilePage);
            document.body.appendChild(customCursor);

            // Apply username effect
            if (usernameElement) {
                applyUsernameEffect(usernameElement);
            }
        });
    }

    // Preview cursor image when selected
    if (elements.cursorImageInput) {
        elements.cursorImageInput.addEventListener('change', (e) => {
            const cursorImage = e.target.files[0];
            if (cursorImage) {
                updateCursor(cursorImage);
            }
        });
    }

    // Add background effect handling
    let rainDrops = [];
    let animationFrame;
    let mouseX = 0;
    let mouseY = 0;

    function createRainDrop() {
        const drop = document.createElement('div');
        drop.className = 'rain-drop';
        drop.style.left = `${Math.random() * 100}%`;
        drop.style.top = '-20px';
        drop.style.opacity = Math.random() * 0.3 + 0.2; 
        drop.style.transform = 'rotate(0deg)';
        return drop;
    }

    function updateRain() {
        const container = document.querySelector('.rain-container');
        if (!container) return;

        // Calculate rain angle based on mouse position
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const angleX = (mouseX - centerX) / centerX * 20; 

        rainDrops.forEach((drop, index) => {
            const top = parseFloat(drop.style.top);
            const left = parseFloat(drop.style.left);

            if (top > window.innerHeight) {
                container.removeChild(drop);
                rainDrops.splice(index, 1);
            } else {
                drop.style.top = `${top + 10}px`; 
                drop.style.left = `${left + angleX / 30}px`;
                drop.style.transform = `rotate(${angleX}deg)`;
            }
        });

        if (rainDrops.length < 200) { 
            const newDrop = createRainDrop();
            container.appendChild(newDrop);
            rainDrops.push(newDrop);
        }

        animationFrame = requestAnimationFrame(updateRain);
    }

    function startRainEffect() {
        const profilePage = document.querySelector('.profile-page');
        if (!profilePage) return;
        
        const container = document.createElement('div');
        container.className = 'rain-container';
        profilePage.appendChild(container);
        updateRain();
    }

    function stopRainEffect() {
        const container = document.querySelector('.rain-container');
        if (container) {
            container.remove();
            rainDrops = [];
            cancelAnimationFrame(animationFrame);
        }
    }

    function createNightEffect() {
        const profilePage = document.querySelector('.profile-page');
        if (!profilePage) return;
        
        const overlay = document.createElement('div');
        overlay.className = 'night-overlay';
        profilePage.appendChild(overlay);
        
        setTimeout(() => {
            overlay.style.opacity = '1';
        }, 0);
    }

    function removeNightEffect() {
        const overlay = document.querySelector('.night-overlay');
        if (overlay) overlay.remove();
    }

    if (elements.backgroundEffect) {
        elements.backgroundEffect.addEventListener('change', (e) => {
            stopRainEffect();
            removeNightEffect();
            
            switch(e.target.value) {
                case 'rain':
                    startRainEffect();
                    break;
                case 'night':
                    createNightEffect();
                    break;
            }
        });
    }

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Load settings from localStorage
    function loadSettings() {
        const savedSettings = localStorage.getItem('profileSettings');
        if (savedSettings) {
            userSettings = JSON.parse(savedSettings);
            
            // Apply saved settings
            if (userSettings.socialLinks) {
                socialLinks = userSettings.socialLinks;
                updateSocialLinksPreview();
            }
            
            const effectSelect = document.getElementById('username-effect');
            if (effectSelect) {
                effectSelect.value = userSettings.usernameEffect || 'none';
            }
            
            const effectColor = document.getElementById('effect-color');
            if (effectColor) {
                effectColor.value = userSettings.effectColor || '#00ff00';
            }
        }
    }

    // Save settings to localStorage
    function saveSettings() {
        userSettings.socialLinks = socialLinks;
        userSettings.usernameEffect = document.getElementById('username-effect')?.value || 'none';
        userSettings.effectColor = document.getElementById('effect-color')?.value || '#00ff00';
        localStorage.setItem('profileSettings', JSON.stringify(userSettings));
    }

    // Add social link handling with icon upload
    document.getElementById('add-social-link')?.addEventListener('click', () => {
        const linkUrl = document.getElementById('social-link')?.value;
        const iconInput = document.getElementById('social-icon-upload');
        
        if (linkUrl && iconInput?.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                socialLinks.push({ 
                    url: linkUrl, 
                    iconUrl: e.target.result 
                });
                updateSocialLinksPreview();
                saveSettings();
                
                // Clear inputs
                document.getElementById('social-link').value = '';
                iconInput.value = '';
                const button = iconInput.previousElementSibling;
                if (button) {
                    button.innerHTML = '<i class="fas fa-image"></i> Choose Icon';
                }
            };
            reader.readAsDataURL(iconInput.files[0]);
        } else {
            alert('Please enter both a URL and select an icon image');
        }
    });

    function updateSocialLinksPreview() {
        const preview = document.getElementById('social-links-preview');
        if (!preview) return;
        
        preview.innerHTML = '';
        socialLinks.forEach((link, index) => {
            const linkElement = document.createElement('div');
            linkElement.className = 'social-link-item';
            linkElement.innerHTML = `
                <img src="${link.iconUrl}" alt="Social Icon" style="width: 24px; height: 24px; object-fit: contain;">
                <span class="remove-link" data-index="${index}">×</span>
            `;
            
            // Add click handler for removal
            linkElement.querySelector('.remove-link').addEventListener('click', () => {
                socialLinks.splice(index, 1);
                updateSocialLinksPreview();
                saveSettings();
            });
            
            preview.appendChild(linkElement);
        });
    }

    // Username effects
    document.getElementById('username-effect')?.addEventListener('change', (e) => {
        const effectColorInput = document.querySelector('.effect-color-input');
        if (effectColorInput) {
            effectColorInput.style.display = e.target.value === 'particles' ? 'block' : 'none';
        }
        saveSettings();
    });

    function applyUsernameEffect(username) {
        const effect = userSettings.usernameEffect;
        const effectColor = userSettings.effectColor;
        
        username.className = 'username';
        
        switch (effect) {
            case 'particles':
                username.classList.add('particles');
                createParticles(username, effectColor);
                break;
            case 'rainbow':
                username.classList.add('rainbow');
                break;
            case 'typewriter':
                username.classList.add('typewriter');
                break;
        }
    }

    function createParticles(element, color) {
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('span');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.backgroundColor = color;
            particle.style.width = '4px';
            particle.style.height = '4px';
            particle.style.animationDelay = Math.random() * 3 + 's';
            element.appendChild(particle);
        }
    }

    // Settings button handling
    document.querySelector('.settings-button')?.addEventListener('click', () => {
        const container = document.querySelector('.container');
        if (container) {
            container.style.display = container.style.display === 'none' ? 'block' : 'none';
        }
    });

    loadSettings();
});