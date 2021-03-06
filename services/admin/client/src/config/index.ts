export const config = {
    enn: process.env.NODE_ENV as string,
    api: {
        url: process.env.REACT_APP_API_URL as string
    },
    website: {
        name: 'Boilerplate Admin',
        copyright: {
            name: 'Gniewomir Świechowski',
            link: 'mailto:gniewomir.swiechowski@gmail.com'
        }
    },
    routes: {
        login: {
            name: 'Login',
            path: '/login'
        },
        password_reset: {
            name: 'Password reset',
            path: '/password_reset'
        },
        register: {
            name: 'Register',
            path: '/register'
        },
        home: {
            name: 'Home',
            path: '/'
        },
        profile: {
            name: 'Profile',
            path: '/profile'
        }
    }
}