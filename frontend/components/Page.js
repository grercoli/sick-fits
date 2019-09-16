//Best Practices: import your packages first and then your local components
import React, { Component } from 'react'
import styled, { ThemeProvider, injectGlobal } from 'styled-components'; //styled tiene acceso a todos los elementos que yo quiera crear, injectGlobal para setear los estilos en toda la pagina
import Header from '../components/Header';
import Meta from '../components/Meta';

//En este archivo me baso en lo que es el theming y el styling.. es un layout

const theme = {
    red: '#FF0000',
    black: '#393939',
    grey: '#3A3A3A',
    lightgrey: '#E1E1E1',
    offWhite: '#EDEDED',
    maxWidth: '1000px',
    bs: '0 12px 24px 0 rgba(0, 0, 0, 0.09)', //bs es box-shadow
};

//crea como una especie de componente llamado StyledPage
const StyledPage = styled.div`
    background: white;
    color: ${props => props.theme.black};
`;

const Inner = styled.div`
    max-width: ${props => props.theme.maxWidth};
    margin: 0 auto;
    padding: 2rem;
`;

//como lo estoy inyectando global no tengo acceso a props.theme (ThemeProvider). Hay que llamarlo en cualquier lugar de la aplicacion, en este caso aca:
injectGlobal`
    @font-face {
        font-family: 'radnika_next';
        src: url('/static/radnikanext-medium-webfont.woff2')
        format('woff2');
        font-weight: normal;
        font-style: normal;
    }
    html {
        box-sizing: border-box;
        font-size: 10px; 
    }
    *, *:before, *:after {
        box-sizing: inherit;
    }
    body {
        padding: 0;
        margin: 0;
        font-size: 1.5rem;
        line-height: 2;
        font-family: 'radnika_next';
    }
    a {
        text-decoration: none;
        color: ${theme.black};
    }
`;

//arriba defini un base font-size de 10px para luego usar rems como base de 10px. El box-sizing: inherit; lo que hace es aplicarle box sizing border-box a todo

//ThemeProvider esta usando Context API: permite especificar valores en lo alto, como por ejemplo la variable theme de mas arriba, y despues cualquier hijo, tal vez con 6 o 7 niveles de profundidad puedan acceder a esos valores
export default class Page extends Component {
    render() {
        return (
            <ThemeProvider theme={theme}>
                <StyledPage>
                    <Meta />
                    <Header />
                    <Inner>{this.props.children}</Inner>
                </StyledPage>
            </ThemeProvider>
        )
    }
}
