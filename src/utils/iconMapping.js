/**
 * Mapeo de emojis a iconos de React Icons
 * Reemplaza emojis del sistema con iconos consistentes
 */

import {
  FaBox,
  FaShoppingCart,
  FaChartBar,
  FaCut,
  FaExclamationTriangle,
  FaCog,
  FaChartLine,
  FaHashtag,
  FaRocket,
  FaTshirt,
  FaPhone,
  FaVideo,
  FaSave,
  FaUndo,
  FaBoxOpen,
  FaWarehouse,
  FaTags,
  FaUsers,
  FaMoneyBillWave,
  FaJeans,
  FaCoat,
  FaDress,
  FaRunning,
  FaShoppingBag,
  FaCircle,
  FaLock,
  FaPaperclip,
  FaTag,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaPlusCircle,
  FaEdit,
  FaTrashAlt,
  FaInfoCircle,
  FaTruck,
  FaCubes,
  FaFileExcel,
  FaFilePdf,
  FaPrint,
  FaSpinner,
} from 'react-icons/fa';

import {
  GiSewingNeedle,
  GiClothes,
  GiSocks,
  GiHoodie,
} from 'react-icons/gi';

import {
  MdOutlineShoppingBag,
} from 'react-icons/md';

// Mapeo de emojis a componentes de iconos
export const emojiToIcon = {
  // Productos y materiales
  '📦': FaBox,
  '🛒': FaShoppingCart,
  '📊': FaChartBar,
  '🧵': GiSewingNeedle,
  '⚠️': FaExclamationTriangle,
  '⚙️': FaCog,
  '📈': FaChartLine,
  '🔢': FaHashtag,
  '🚀': FaRocket,
  '📞': FaPhone,
  '🎥': FaVideo,
  '💾': FaSave,
  '↩️': FaUndo,
  
  // Ropa y accesorios
  '👕': FaTshirt,
  '👖': FaJeans,
  '👗': FaDress,
  '🧥': FaCoat,
  '👔': GiClothes,
  '🩳': FaRunning,
  '👜': FaShoppingBag,
  '🧶': GiSewingNeedle,
  
  // Materiales
  '⚪': FaCircle,
  '🔒': FaLock,
  '📎': FaPaperclip,
  '🏷️': FaTag,
  
  // Inventario y almacén
  '📦': FaBoxOpen,
  '🏷️': FaTags,
  
  // Personas y usuarios
  '👥': FaUsers,
  
  // Finanzas
  '💰': FaMoneyBillWave,
  
  // Estados
  '✅': FaCheckCircle,
  '⏳': FaClock,
  '🔄': FaSpinner,
  '❌': FaTimesCircle,
  
  // Acciones
  '➕': FaPlusCircle,
  
  // Documentos y archivos
  '📄': FaFileExcel,
  '🖨️': FaPrint,
  
  // Transporte
  '🚚': FaTruck,
  
  // Otros
  '🔵': FaCircle,
};

// Función helper para obtener el componente de icono
export const getIconComponent = (emoji, defaultIcon = FaBox) => {
  return emojiToIcon[emoji] || defaultIcon;
};

// Objeto con los iconos como componentes React para usar directamente
export const icons = {
  box: FaBox,
  cart: FaShoppingCart,
  chart: FaChartBar,
  needle: GiSewingNeedle,
  warning: FaExclamationTriangle,
  settings: FaCog,
  lineChart: FaChartLine,
  number: FaHashtag,
  rocket: FaRocket,
  phone: FaPhone,
  video: FaVideo,
  save: FaSave,
  undo: FaUndo,
  tshirt: FaTshirt,
  jeans: FaJeans,
  dress: FaDress,
  coat: FaCoat,
  clothes: GiClothes,
  shorts: FaRunning,
  bag: FaShoppingBag,
  circle: FaCircle,
  lock: FaLock,
  paperclip: FaPaperclip,
  tag: FaTag,
  tags: FaTags,
  users: FaUsers,
  money: FaMoneyBillWave,
  check: FaCheckCircle,
  clock: FaClock,
  spinner: FaSpinner,
  times: FaTimesCircle,
  plus: FaPlusCircle,
  edit: FaEdit,
  trash: FaTrashAlt,
  info: FaInfoCircle,
  truck: FaTruck,
  cubes: FaCubes,
  excel: FaFileExcel,
  pdf: FaFilePdf,
  print: FaPrint,
  warehouse: FaWarehouse,
  boxOpen: FaBoxOpen,
  fabric: GiClothes,
  shirt: GiClothes,
  skirt: FaDress,
};

/**
 * Mapea nombres de iconos de la base de datos a componentes React Icons
 * @param {string} iconName - Nombre del icono desde la base de datos
 * @param {Component} defaultIcon - Icono por defecto si no se encuentra
 * @returns {Component} Componente de React Icon
 */
export const getIconByName = (iconName, defaultIcon = FaBox) => {
  if (!iconName) return defaultIcon;
  const lowerName = iconName.toLowerCase();
  return icons[lowerName] || defaultIcon;
};

export default icons;
