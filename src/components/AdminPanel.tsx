interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
  image: string;
  plan: string;
  startDate: string;
  endDate: string;
  paymentMethod: string;
  paymentStatus: string;
}

<img
  className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover"
  src={getPhotoUrl(user.image)}
  alt={user.name}
  onError={(e) => {
    const target = e.target as HTMLImageElement;
    target.src = '/default-avatar.png';
    target.onerror = null;
  }}
/> 