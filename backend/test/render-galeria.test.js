const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

class FakeElement {
    constructor(tagName) {
        this.tagName = tagName;
        this.children = [];
        this.attributes = {};
        this.className = '';
        this.textContent = '';
        this.classList = {
            add: name => {
                const classes = new Set(this.className.split(/\s+/).filter(Boolean));
                classes.add(name);
                this.className = [...classes].join(' ');
            }
        };
    }

    append(...children) {
        children.forEach(child => this.appendChild(child));
    }

    appendChild(child) {
        this.children.push(child);
        return child;
    }

    replaceChildren(...children) {
        this.children = [];
        this.append(...children);
    }

    setAttribute(name, value) {
        this.attributes[name] = value;
    }

    addEventListener() {}

    querySelector(selector) {
        const className = selector.slice(1);
        for (const child of this.children) {
            if (
                typeof child.className === 'string' &&
                child.className.split(/\s+/).includes(className)
            ) {
                return child;
            }
            const nested = child.querySelector?.(selector);
            if (nested) return nested;
        }
        return null;
    }
}

test('renderGaleria trata los valores de mascotas como texto y no como HTML', () => {
    const document = {
        createElement: tagName => new FakeElement(tagName),
        createTextNode: text => ({ textContent: text }),
        addEventListener() {}
    };
    const window = {};
    const source = fs.readFileSync(
        path.join(__dirname, '..', '..', 'js', 'app.js'),
        'utf8'
    );
    const context = vm.createContext({ document, window });
    vm.runInContext(source, context);

    const container = new FakeElement('div');
    Object.defineProperty(container, 'innerHTML', {
        set() {
            throw new Error('No debe usarse innerHTML para datos dinámicos');
        }
    });
    const maliciousName = '<img src=x onerror=alert(1)>';
    const maliciousDescription = '<script>alert(1)</script>';
    const mascota = {
        id: 23,
        nombre: maliciousName,
        descripcion: maliciousDescription,
        estado: 'En Proceso',
        edad: 2,
        raza: '<b>Raza</b>',
        imagen: 'img/mascota.png'
    };

    assert.equal(context.renderGaleria(container, [mascota]), 1);
    assert.equal(container.children.length, 1);

    const card = container.children[0];
    const info = card.querySelector('.info-mascota');
    const title = info.children.find(child => child.tagName === 'h2');
    const description = info.children.find(child => child.className === 'descripcion');
    const image = card.querySelector('.contenedor-img').children
        .find(child => child.tagName === 'img');

    assert.equal(title.textContent, maliciousName);
    assert.equal(description.textContent, maliciousDescription);
    assert.equal(image.src, 'img/mascota.png');
    assert.equal(image.alt, maliciousName);
});
