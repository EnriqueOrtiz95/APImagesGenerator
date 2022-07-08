const resultado = document.querySelector('#resultado');
const formulario = document.querySelector('#formulario');
const paginacionDiv = document.querySelector('#paginacion');
let terminoBusqueda = document.querySelector('#termino');
const buscadorContainer = document.querySelector('.buscador');
const btnSort = document.querySelector('.btn-sort');
let imagenesArr;

const registrosPorPagina = 40;
let totalPaginas;
let iterador;
// let totalHitsArr = [];
let paginaActual = 1;

window.onload = () => {
    formulario.addEventListener('submit', validarFormulario);
    terminoBusqueda.value = ''
    btnSort.style.display = 'none'
}


function validarFormulario(e){
    e.preventDefault();

    terminoBusqueda = terminoBusqueda.value;

    if(terminoBusqueda === ''){
        mostrarAlerta('agrega un termino de busqueda');
        borrarResultado();
        borrarPaginacion();
        return;
    }
    btnSort.style.display = 'block'
    btnSort.selectedIndex = 0;

    buscarImagenes();
}

function borrarResultado(){
    while(resultado.firstChild){
        resultado.removeChild(resultado.firstChild);
    }
}
function borrarPaginacion(){
    while(paginacionDiv.firstChild){
        paginacionDiv.removeChild(paginacionDiv.firstChild);
    }
}

function mostrarAlerta(mensaje){

    const existeAlerta = document.querySelector('.bg-red-100');
    
    if(!existeAlerta){
        const alerta = document.createElement('p');
        alerta.classList.add('bg-red-100', 'border-red-400', 'text-red-700', 'px-4', 'py-3', 'rounded', 'max-w-lg', 'mx-auto', 'mt-6', 'text-center');
    
        alerta.innerHTML = `
            <strong class = "font-bold">Error!</strong>
            <span class = "block sm:inline">${mensaje}</span>
        `;
    
        formulario.appendChild(alerta);
    
        setTimeout(() => {
            alerta.remove();
        }, 3000);
    }
}

function buscarImagenes(){

    const termino = document.querySelector('#termino').value;


    const key = '27675957-9b87e3b7640ee6b6865c0c121';
    const url = `https://pixabay.com/api/?key=${key}&q=${termino}&per_page=${registrosPorPagina}&page=${paginaActual}`;

    fetch(url)
        .then(respuesta => respuesta.json())
        .then(resultado => {
            // console.log(resultado);
            // console.log(resultado.hits);
            // totalHitsArr.push(resultado.hits)
            //TODO ? OJO AQUI
            totalPaginas = calcularPaginas(resultado.totalHits); 
            mostrarImagenes(resultado.hits);
        })
    
}

//?GENERATOR THAT WILL YIELDS THE NUMBER OF ELEMENTS ACCORDING TO THE PAGES
function *crearPaginador(total){
    for(let i = 1; i <= total; i++){
        yield i;
    }
}

function calcularPaginas(total){
    return parseInt(Math.ceil(total/registrosPorPagina));
}

let sorted = false;
btnSort.addEventListener('change', function(e){
    e.preventDefault();
        if(btnSort.selectedIndex === 0){
            setTimeout(() => {
                mostrarImagenes(imagenesArr, false, false)
                return;
            }, 1000);
        }
        if(btnSort.selectedIndex === 1){
            setTimeout(() => {
                mostrarImagenes(imagenesArr, !sorted, false)
                // sorted = !sorted;
                return;
            }, 1000);
        } 
        if(btnSort.selectedIndex === 2){
            setTimeout(() => {
                mostrarImagenes(imagenesArr, false, !sorted)
                // sorted = !sorted;
                return;
            }, 1000);
        }

    //?WITH BUTTON
    // if(this.classList.contains('active')){
    //     this.classList.toggle('active');
    //     this.textContent = 'Desordenar ↔';
    // }
    // else{
    //     this.classList.toggle('active');
    //     this.textContent = 'Ordenar por views';
    // }
    // setTimeout(() => {
    //     mostrarImagenes(imagenesArr, !sorted);
    //     sorted = !sorted;
    //     console.log('todo fine');
    //     console.log(imagenesArr);
                
    // }, 1000);
})

function mostrarImagenes(imagenes, viewsSort = false, likesSort = false){
    // console.log(imagenes);
    borrarResultado();
    imagenesArr = imagenes;
    
    const sortImgs =  viewsSort ? imagenesArr.sort((a,b) => b.views - a.views) : 
                      likesSort ? imagenesArr.sort((a,b) => b.likes - a.likes) :
                      imagenes;

    //?LOOP THROUGH THE ARRAY OF IMAGES AND BUILD THE HTML
    sortImgs.forEach( imagen => {
        const { previewURL, likes, views, largeImageURL } = imagen;

        resultado.innerHTML += `
            <div class="w-1/2 md:w-1/3 lg:w-1/4 p-3 mb-4">
                <div class="bg-white">
                    <img class = "w-full h-40 object-cover" src="${previewURL}">

                    <div class="p-4">
                        <p class="font-bold"> ${likes}<span class="font-light"> Me gusta</span></p>
                        <p class="font-bold"> ${views}<span class="font-light"> Veces Vista</span></p>

                        <a class="block w-full bg-blue-800 hover:bg-blue-500 text-white uppercase font-bold text-center rounded mt-5" 
                        href="${largeImageURL}" target="_blank" rel="noopener noreferrer">
                        Ver Imagen
                        </a>
                    </div>
                </div>
            </div>
        `   
    })

    //?CLEAN THE PREVIOUS PAGINATOR
    borrarPaginacion();
    
    //?YIELD NEW HTML
    imprimirPaginador();
    

    const siguienteBtn = document.querySelectorAll('.siguiente');

    siguienteBtn.forEach(e => e.addEventListener('click', function(e){
    e.preventDefault();

    sorted = false;
    btnSort.classList.remove('active');
    btnSort.selectedIndex = 0;
    }))
}

//?FUNCTION THAT COMPLEMENTS THE GENERATOR, IT WORKS TO VISUALIZE THE PAG BUTTONS
function imprimirPaginador(){
    iterador = crearPaginador(totalPaginas);

    //?WHILE ITERATOR IS DIFFERENT OF DONE, KEEP CREATING PAG BUTTONS
    while(true){
        const { value, done } = iterador.next();
        if(done) return;

        //?YIELDING BUTTONS
        const boton = document.createElement('a');
        boton.href = '#';
        boton.dataset.pagina = value; //*1, 2, 3, 4 ....
        boton.textContent = value;
        boton.classList.add('siguiente', 'bg-yellow-400', 'px-4', 'py-1', 'mr-2', 'font-bold', 'mb-3', 'uppercase', 'rounded');

        boton.onclick = () =>{
            paginaActual = value;
            console.log(paginaActual);
            buscarImagenes();
        }

        paginacionDiv.appendChild(boton);
    }
}