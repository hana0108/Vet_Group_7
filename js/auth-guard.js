(() => {
    if (sessionStorage.getItem('usuarioSesion') !== 'activa') {
        window.location.replace('login.html');
    }
})();