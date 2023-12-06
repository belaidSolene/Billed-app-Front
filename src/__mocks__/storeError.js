const mockedError500 = {
  list: () => {
    return Promise.reject(new Error("Erreur 500"))
  }
}

const mockedError400 = {
  list: () => {
    return Promise.reject(new Error("Erreur 400"))
  }
}

export default {
 /*  error500() {
    return  mockedError500
  }, */
  error400(){
    return mockedError400
  }
}

