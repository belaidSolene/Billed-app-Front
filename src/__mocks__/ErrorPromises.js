export const errorPromise = (errorType) => {
  return Promise.reject(new Error(errorType))
}

export const error404 = () => {
  return Promise.reject(new Error("Erreur 404"))
}

export const error500 = () => {
  return Promise.reject(new Error("Erreur 500"))
}