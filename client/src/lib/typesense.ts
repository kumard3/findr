import Typesense from 'typesense';

const client = new Typesense.Client({
  nodes: [
    {
      host: 'localhost', // Replace with your server's IP if hosting remotely
      port: 8108,
      protocol: 'http',
    },
  ],
  apiKey: 'xyz', // Replace with your actual admin API key
});

export default client;
