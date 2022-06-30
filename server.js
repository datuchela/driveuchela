require('dotenv').config()
const multer = require('multer')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const File = require('./models/File')
const path = require('path')

const express = require('express')
const app = express()
app.use(express.urlencoded({ extended: true }))

const upload = multer({ dest: 'uploads' })

const connectDB = async (URI) => {
  console.log('Connecting to DB...')
  return mongoose.connect(URI)
}

app.set('view engine', 'ejs')

app.get('/', (req, res) => {
  res.render('index')
})

const uploadMiddleware = async (req, res) => {
  let loading = true
  upload.single('file')
  const fileData = {
    path: req.file.path,
    originalName: req.file.originalname,
  }
  if (req.body.password !== null && req.body.password !== '') {
    fileData.password = await bcrypt.hash(req.body.password, 10)
  }
  const file = await File.create(fileData)
  loading = false
  res.render('index', {
    fileLink: `${req.headers.origin}/file/${file.id}`,
    fileName: file.originalName,
    password: req.body.password,
    loading: loading,
  })
}

app.post('/upload', upload.single('file'), async (req, res) => {
  const fileData = {
    path: req.file.path,
    originalName: req.file.originalname,
  }
  if (req.body.password !== null && req.body.password !== '') {
    fileData.password = await bcrypt.hash(req.body.password, 10)
  }
  const file = await File.create(fileData)
  loading = false
  res.render('index', {
    fileLink: `${req.headers.origin}/file/${file.id}`,
    fileName: file.originalName,
    password: req.body.password,
  })
})

const handleDownload = async (req, res) => {
  const file = await File.findById(req.params.id)
  if (file.password !== undefined) {
    if (req.body.password == null) {
      res.render('password')
      return
    }
    if (!(await bcrypt.compare(req.body.password, file.password))) {
      res.render('password', { error: true })
      return
    }
  }
  file.downloadCount++
  await file.save()
  res.download(file.path, file.originalName)
}

app.route('/file/:id').get(handleDownload).post(handleDownload)

const PORT = process.env.PORT || 5000

const serverStart = async () => {
  try {
    await connectDB(process.env.MONGODB_URI)
    console.log('Connected to DB!')
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is up and running on port ${PORT}`)
    })
  } catch (err) {
    console.error(err)
  }
}

serverStart() // starts the server
