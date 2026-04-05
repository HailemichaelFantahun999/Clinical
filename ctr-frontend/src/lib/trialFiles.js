export function getUploadedFileName(file) {
  if (!file) return ''
  if (typeof file === 'string') return file
  if (typeof file.name === 'string') return file.name
  return ''
}

export function canDownloadUploadedFile(file) {
  return !!(
    (file && typeof file === 'object' && typeof file.name === 'string' && file.downloadable === true) ||
    hasStoredUploadContent(file)
  )
}

export function hasStoredUploadContent(file) {
  return !!(
    file &&
    typeof file === 'object' &&
    typeof file.name === 'string' &&
    typeof file.contentBase64 === 'string' &&
    file.contentBase64
  )
}

export function readFileAsStoredUpload(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = String(reader.result || '')
      const commaIndex = result.indexOf(',')
      resolve({
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size || 0,
        contentBase64: commaIndex >= 0 ? result.slice(commaIndex + 1) : result
      })
    }
    reader.onerror = () => reject(new Error('Unable to read the selected file.'))
    reader.readAsDataURL(file)
  })
}

