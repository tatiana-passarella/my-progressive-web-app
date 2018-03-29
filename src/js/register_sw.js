document.addEventListener('DOMContentLoaded', (event) => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('../sw.js').then((reg) => {
                console.log('Service worker registration successful with scope: ', reg.scope);
                if (reg.installing) {
                    console.log('Service worker installing');
                } else if (reg.waiting) {
                    console.log('Service worker installed');
                } else if (reg.active) {
                    console.log('Service worker active');
                }

            }).catch((error) => {
            // registration failed
            console.log('Registration failed with ' + error);
        });
    }
});
