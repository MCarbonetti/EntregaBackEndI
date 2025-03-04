const express = require('express');
const fs = require('fs/promises');
const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const PORT = 8080;


const productsFile = './products.json';
const cartsFile = './carts.json';


const readFile = async (path) => JSON.parse(await fs.readFile(path, 'utf-8'));
const writeFile = async (path, data) => await fs.writeFile(path, JSON.stringify(data, null, 2));


const ProductManager = {
async getAll() {
    const products = await readFile(productsFile);
    return products;
},
async getById(id) {
    const products = await this.getAll();
    return products.find((product) => product.id === id);
},
async add(product) {
    const products = await this.getAll();
    product.id = products.length ? products[products.length - 1].id + 1 : 1;
    products.push(product);
    await writeFile(productsFile, products);
    return product;
},
async update(id, data) {
    const products = await this.getAll();
    const index = products.findIndex((product) => product.id === id);
    if (index === -1) return null;
    products[index] = { ...products[index], ...data, id };
    await writeFile(productsFile, products);
    return products[index];
},
async delete(id) {
    const products = await this.getAll();
    const filtered = products.filter((product) => product.id !== id);
    await writeFile(productsFile, filtered);
    return filtered;
},
};


const CartManager = {
async getAll() {
    const carts = await readFile(cartsFile);
    return carts;
},
async getById(id) {
    const carts = await this.getAll();
    return carts.find((cart) => cart.id === id);
},
async create() {
    const carts = await this.getAll();
    const cart = { id: carts.length ? carts[carts.length - 1].id + 1 : 1, products: [] };
    carts.push(cart);
    await writeFile(cartsFile, carts);
    return cart;
},
async addProductToCart(cartId, productId, quantity = 1) {
    const carts = await this.getAll();
    const cart = carts.find((c) => c.id === cartId);
    if (!cart) return null;

    const product = cart.products.find((p) => p.product === productId);
    if (product) {
    product.quantity += quantity;
    } else {
    cart.products.push({ product: productId, quantity });
    }

    await writeFile(cartsFile, carts);
    return cart;
},
};

const productRouter = express.Router();
productRouter.get('/', async (req, res) => res.json(await ProductManager.getAll()));
productRouter.get('/:pid', async (req, res) => {
const product = await ProductManager.getById(parseInt(req.params.pid));
product ? res.json(product) : res.status(404).send('Producto no encontrado');
});
productRouter.post('/', async (req, res) => {
const { title, description, code, price, status, stock, category, thumbnails } = req.body;
if (!title || !description || !code || !price || stock === undefined || !category)
    return res.status(400).send('Datos incompletos');
const product = await ProductManager.add({ title, description, code, price, status, stock, category, thumbnails });
res.status(201).json(product);
});
productRouter.put('/:pid', async (req, res) => {
const updated = await ProductManager.update(parseInt(req.params.pid), req.body);
updated ? res.json(updated) : res.status(404).send('Producto no encontrado');
});
productRouter.delete('/:pid', async (req, res) => {
const result = await ProductManager.delete(parseInt(req.params.pid));
res.json(result);
});

const cartRouter = express.Router();
cartRouter.post('/', async (req, res) => res.status(201).json(await CartManager.create()));
cartRouter.get('/:cid', async (req, res) => {
const cart = await CartManager.getById(parseInt(req.params.cid));
cart ? res.json(cart) : res.status(404).send('Carrito no encontrado');
});
cartRouter.post('/:cid/product/:pid', async (req, res) => {
const { cid, pid } = req.params;
const updatedCart = await CartManager.addProductToCart(parseInt(cid), parseInt(pid));
updatedCart ? res.json(updatedCart) : res.status(404).send('Carrito o producto no encontrado');
});


app.use('/api/products', productRouter);
app.use('/api/carts', cartRouter);


const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app); 
const io = new Server(server); 

io.on('connection', (socket) => {
    console.log('Un cliente se ha conectado');
});

server.listen(3000, () => {
    console.log("Servidor escuchando en el puerto 3000");
});


const express = require('express');
const { create } = require('express-handlebars');
const path = require('path');

const hbs = create({
    extname: '.handlebars',
    defaultLayout: 'main',
});

app.engine('.handlebars', hbs.engine);
app.set('view engine', '.handlebars');
app.set('views', path.join(__dirname, 'views'));

const productos = []; 

app.get('/home', (req, res) => {
    res.render('home', { productos });
});

app.get('/realtimeproducts', (req, res) => {
    res.render('realTimeProducts', { productos });
});

