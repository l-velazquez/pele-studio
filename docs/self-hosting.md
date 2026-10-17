# Running Pele Studio

Pele Studio is a static web app. After it's built, it's only HTML, JavaScript, CSS, and font files. Diagrams render in the browser and autosave to the browser's IndexedDB. Nothing is sent to a server, and the app makes no outside network requests, so you can run it offline or on a private network.

You can run it in three ways:

| Option | Use it for | Needs |
| --- | --- | --- |
| [Development server](#1-development-server) | Changing the code | Node.js 22+ |
| [Docker on your computer](#2-docker-on-your-computer) | Using the app locally without installing Node | Docker |
| [Server](#3-on-a-server) | Hosting it for yourself or others | Docker, or any static file host |

## Get the code

```sh
git clone https://github.com/l-velazquez/pele-editor.git
cd pele-editor
```

## 1. Development server

Use Node.js 22 or newer. Check with `node -v`.

```sh
npm install
npm run dev
```

Open http://localhost:5173. Saving a source file reloads the page.

Other commands:

```sh
npm test          # run the tests
npm run lint      # run oxlint
npm run build     # type-check and build the static site into dist/
npm run preview   # serve dist/ at http://localhost:4173 to check a production build
```

## 2. Docker on your computer

You don't need Node for this, only [Docker Desktop](https://www.docker.com/products/docker-desktop/) or Docker Engine.

```sh
docker compose up -d --build
```

Open http://localhost:8080.

```sh
docker compose logs -f   # follow the logs
docker compose down      # stop it
```

To use a different port, change the left number in `compose.yaml`. For example, `"3000:8080"` serves the app at http://localhost:3000.

Without Compose:

```sh
docker build -t pele-studio .
docker run -d --name pele-studio -p 8080:8080 --restart unless-stopped pele-studio
```

### What the image contains

- **Build stage:** `node:22-alpine` installs dependencies with `npm ci` and runs `npm run build`.
- **Runtime stage:** `nginxinc/nginx-unprivileged` serves `dist/` as user 101 (not root) on port **8080**. The image is about 80 MB, and Node isn't in it.
- **`/healthz`** returns `ok`. Docker's `HEALTHCHECK` uses it, so `docker ps` shows the container as `healthy`.
- **Caching:** files under `/assets/` have a content hash in their name, so they're cached for a year. `index.html` uses `no-cache`, so browsers see a new deploy on their next visit.

## 3. On a server

### Option A: Docker Compose with automatic HTTPS (recommended)

This needs a Linux server with Docker installed, and a domain name with a DNS `A` record that points to the server.

Run the clipboard buttons in the export dialog over HTTPS. Browsers allow clipboard access only on secure origins: HTTPS or `localhost`. Over plain HTTP on a server, copying fails, but downloading still works.

[Caddy](https://caddyserver.com/) gets a Let's Encrypt certificate for you and renews it automatically. On the server, clone the repo, then create `compose.prod.yaml` next to `compose.yaml`:

```yaml
services:
  pele-studio:
    build: .
    restart: unless-stopped
    # No published port. Only Caddy can reach the app.

  caddy:
    image: caddy:2-alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
      - "443:443/udp"
    command: caddy reverse-proxy --from diagrams.example.com --to pele-studio:8080
    volumes:
      - caddy_data:/data

volumes:
  caddy_data:
```

Replace `diagrams.example.com` with your domain, then start it:

```sh
docker compose -f compose.prod.yaml up -d --build
```

Open ports 80 and 443 in the server's firewall. On Ubuntu with ufw, run `sudo ufw allow 80,443/tcp`. Caddy needs port 80 to get the certificate.

### Option B: Behind a reverse proxy you already have

If the server already runs nginx, Traefik, Dokploy, Coolify, or something similar, start only the app container. Bind it to localhost so it can't be reached directly:

```sh
docker build -t pele-studio .
docker run -d --name pele-studio -p 127.0.0.1:8080:8080 --restart unless-stopped pele-studio
```

Then proxy your domain to `http://127.0.0.1:8080`. For nginx:

```nginx
server {
  server_name diagrams.example.com;
  location / {
    proxy_pass http://127.0.0.1:8080;
    proxy_set_header Host $host;
  }
}
```

For HTTPS, run `sudo certbot --nginx -d diagrams.example.com`.

On Dokploy or Coolify, create an app from this repository with the Dockerfile build type and set the container port to **8080**.

### Option C: Any static host, without Docker

`npm run build` writes a self-contained site to `dist/`. Upload that folder to any static host or web server, such as Netlify, Cloudflare Pages, S3, or an existing nginx or Apache `root`.

Two settings matter:

- **Fallback:** if a path isn't found, serve `index.html` instead. This is what `try_files $uri /index.html` does in nginx.
- **Subpath:** if the app isn't at the root of the domain, for example `https://example.com/pele/`, build it with that path:

  ```sh
  BASE_PATH=/pele/ npm run build
  ```

  If the subpath is wrong, the page loads blank and the browser console shows 404s for `/assets/...`.

### Option D: GitHub Pages

`.github/workflows/pages.yml` runs the tests, builds, and deploys on every push to `main`. It sets `BASE_PATH` to `/<repo-name>/` for you. To turn it on for a fork, go to **Settings → Pages → Source** and select **GitHub Actions**.

## Updating

```sh
git pull
docker compose up -d --build                          # Docker on your computer
docker compose -f compose.prod.yaml up -d --build     # server with Caddy
```

Each user's saved diagrams stay in their own browser, so updating the server doesn't touch them.

## Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| `port is already allocated` | Something else is using 8080. Change the host port in `compose.yaml`, for example `"3000:8080"`. |
| Blank page, 404s for `/assets/...` | The site is served from a subpath. Rebuild with `BASE_PATH=/your-path/`. |
| Copy to clipboard fails | The page isn't on HTTPS. Use Option A, or add HTTPS to your proxy. |
| Saved diagrams are gone | Autosave is stored per browser and per origin. A new domain, port, or protocol, a private window, or clearing site data starts with an empty store. Export diagrams you want to keep. |
| The old version still shows after a deploy | Reload the page. If you put a CDN in front, purge its cache for `index.html`. |
