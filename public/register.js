const mensajeError=document.getElementsByClassName("error")[0];



const form  = document.getElementById('register_form');  // id exacto en tu HTML
form.addEventListener('submit', async e => {
  e.preventDefault();
  
  const elems = form.elements;
  
  const payload = {
    tipo_documento:   elems['tipo-documento'].value,
    num_documento: elems['num-documento'].value,
    fecha_emision:    elems['fecha-emision'].value,
    password_create:         elems['password'].value,
    mayor:            elems['mayor'].checked,
    menor:            elems['menor'].checked
  };
  
  try {
    const res = await fetch('/api/register', {   // ⚠️ abre el objeto
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload)
    });                                                               // ⚠️ cierra el objeto y la llamada


    const resJson = await res.json();

    if (!res.ok) {
      return mensajeError.classList.toggle("escondido",false);
    }

    if(resJson.redirect){
      window.location.href = resJson.redirect;
    }

  } catch (err) {
    console.error('Error en fetch:', err);
  }
});
