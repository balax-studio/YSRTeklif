window.handleFileUpload = async function(event) {
  const file = event.target.files[0];
  if (!file) return;

  const storageRef = window.storage.ref();
  const fileRef = storageRef.child('teklif_dosyalari/' + new Date().getTime() + '_' + file.name);

  // Show progress bar
  const progressContainer = document.getElementById('fileUploadProgress');
  const progressBar = document.getElementById('fileUploadBar');
  const progressPercent = document.getElementById('fileUploadPercent');
  
  if (progressContainer) progressContainer.style.display = 'block';

  const uploadTask = fileRef.put(file);

  uploadTask.on('state_changed', 
    (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      if (progressBar) progressBar.style.width = progress + '%';
      if (progressPercent) progressPercent.innerText = Math.round(progress) + '%';
    }, 
    (error) => {
      console.error('Dosya yükleme hatası:', error);
      alert('Dosya yüklenirken bir hata oluştu: ' + error.message);
      if (progressContainer) progressContainer.style.display = 'none';
    }, 
    async () => {
      // Yükleme tamamlandı
      const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
      
      const fileUrlInput = document.getElementById('f_fileUrl');
      const fileNameInput = document.getElementById('f_fileName');
      
      if (fileUrlInput) fileUrlInput.value = downloadURL;
      if (fileNameInput) fileNameInput.value = file.name;
      
      if (progressPercent) progressPercent.innerText = 'Yüklendi!';
      setTimeout(() => {
        if (progressContainer) progressContainer.style.display = 'none';
      }, 2000);
    }
  );
};
