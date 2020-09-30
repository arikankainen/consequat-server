export const initialUsers = [
  {
    username: 'admin',
    password: '12345',
    email: 'admin@test.fi',
    fullname: 'Administrator',
    isAdmin: true,
  },
  {
    username: 'user',
    password: '00000',
    email: 'user@test.fi',
    fullname: 'Normal User',
    isAdmin: false,
  },
  {
    username: 'special',
    password: '99999',
    email: 'special@admin.fi',
    fullname: 'Special User',
    isAdmin: false,
  },
];

export const initialPhotos = [
  {
    mainUrl: 'https://main.url',
    thumbUrl: 'https://thumb.url',
    filename: 'filename.jpg',
    thumbFilename: 'thumbFilename.jpg',
    originalFilename: 'originalFilename.jpg',
    width: 150,
    height: 100,
    name: 'Photo name',
    location: 'Photo location',
    description: 'Photo description',
    hidden: false,
    tags: ['landscape', 'animals'],
    album: null,
    user: '',
  },
  {
    mainUrl: 'https://main.url2',
    thumbUrl: 'https://thumb.url2',
    filename: 'filename2.jpg',
    thumbFilename: 'thumbFilename2.jpg',
    originalFilename: 'originalFilename2.jpg',
    width: 140,
    height: 90,
    name: 'Photo name2',
    location: 'Photo location2',
    description: 'Photo description2',
    hidden: false,
    tags: ['testTag1', 'landscape', 'night', 'forrest'],
    album: null,
    user: '',
  },
  {
    mainUrl: 'https://main.url3',
    thumbUrl: 'https://thumb.url3',
    filename: 'filename3.jpg',
    thumbFilename: 'thumbFilename3.jpg',
    originalFilename: 'originalFilename3.jpg',
    width: 160,
    height: 110,
    name: 'Photo name3',
    location: 'Photo location3',
    description: 'Photo description3',
    hidden: false,
    tags: ['animals', 'cat'],
    album: null,
    user: '',
  },
  {
    mainUrl: 'https://main.url4',
    thumbUrl: 'https://thumb.url4',
    filename: 'filename4.jpg',
    thumbFilename: 'thumbFilename4.jpg',
    originalFilename: 'originalFilename4.jpg',
    width: 100,
    height: 150,
    name: 'Photo name4',
    location: 'Photo location4',
    description: 'Photo description4',
    hidden: false,
    tags: ['portrait', 'photomodel'],
    album: null,
    user: '',
  },
  {
    mainUrl: 'https://main.url5',
    thumbUrl: 'https://thumb.url5',
    filename: 'filename5.jpg',
    thumbFilename: 'thumbFilename5.jpg',
    originalFilename: 'originalFilename5.jpg',
    width: 90,
    height: 140,
    name: 'Photo name5',
    location: 'Photo location5',
    description: 'Photo description5',
    hidden: true,
    tags: [''],
    album: null,
    user: '',
  },
];

export const initialAlbums = [
  {
    name: 'Album1',
    description: 'Description1',
    photos: [],
    user: '',
  },
  {
    name: 'Album2',
    description: 'Description2',
    photos: [],
    user: '',
  },
  {
    name: 'Album3',
    description: 'Description3',
    photos: [],
    user: '',
  },
];

export const initialComments = [
  {
    text: 'CommentText1',
    author: '',
    photo: '',
  },
  {
    text: 'CommentText2',
    author: '',
    photo: '',
  },
  {
    text: 'CommentText3',
    author: '',
    photo: '',
  },
  {
    text: 'CommentText4',
    author: '',
    photo: '',
  },
  {
    text: 'CommentText5',
    author: '',
    photo: '',
  },
  {
    text: 'CommentText6',
    author: '',
    photo: '',
  },
  {
    text: 'CommentText7',
    author: '',
    photo: '',
  },
  {
    text: 'CommentText8',
    author: '',
    photo: '',
  },
  {
    text: 'CommentText9',
    author: '',
    photo: '',
  },
  {
    text: 'CommentText10',
    author: '',
    photo: '',
  },
];

export const initialComments2 = [
  {
    text: 'CommentText11',
    author: '',
    photo: '',
  },
  {
    text: 'CommentText12',
    author: '',
    photo: '',
  },
  {
    text: 'CommentText13',
    author: '',
    photo: '',
  },
  {
    text: 'CommentText14',
    author: '',
    photo: '',
  },
  {
    text: 'CommentText15',
    author: '',
    photo: '',
  },
];
