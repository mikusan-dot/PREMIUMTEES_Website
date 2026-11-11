import app from './app.js';
import { initFirebase } from './config/firebase.js';
import { repairLegacyVariants } from './services/firestoreService.js';

const PORT = process.env.PORT || 5000;

initFirebase();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT} (${process.env.NODE_ENV || 'development'})`);
  repairLegacyVariants();
});
