"""Install the local MongoDB 8.0 binary from its official Windows ZIP.

Uses HTTPS byte ranges to fetch runtime files without the large debug symbols.
Python 3's zipfile checks each extracted member's CRC. No system service is added.
"""
import io
import pathlib
import urllib.request
import zipfile

URL = "https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-8.0.23.zip"
DESTINATION = pathlib.Path(__file__).resolve().parent.parent / ".local" / "mongodb"


class RemoteArchive(io.RawIOBase):
    def __init__(self):
        with urllib.request.urlopen(urllib.request.Request(URL, method="HEAD"), timeout=60) as response:
            self.size = int(response.headers["Content-Length"])
        self.position = 0
        self.tail_start = max(0, self.size - 131072)
        self.tail = self.fetch(self.tail_start, self.size - 1)

    def fetch(self, start, end):
        request = urllib.request.Request(URL, headers={"Range": f"bytes={start}-{end}"})
        with urllib.request.urlopen(request, timeout=180) as response:
            if response.status != 206:
                raise RuntimeError("The MongoDB server did not support the requested partial download.")
            if not response.headers.get("Content-Range", "").startswith(f"bytes {start}-{end}/"):
                raise RuntimeError("The MongoDB download returned an unexpected byte range.")
            data = response.read()
        if len(data) != end - start + 1:
            raise RuntimeError("The MongoDB download was incomplete; rerun the installer.")
        return data

    def seek(self, offset, whence=0):
        self.position = offset if whence == 0 else (self.position + offset if whence == 1 else self.size + offset)
        return self.position

    def tell(self):
        return self.position

    def seekable(self):
        return True

    def readable(self):
        return True

    def read(self, size=-1):
        end = self.size if size < 0 else min(self.size, self.position + size)
        if end <= self.position:
            return b""
        if self.position >= self.tail_start:
            data = self.tail[self.position - self.tail_start:end - self.tail_start]
        else:
            data = self.fetch(self.position, end - 1)
        self.position = end
        return data


def main():
    DESTINATION.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(RemoteArchive()) as archive:
        members = []
        for member in archive.infolist():
            path = pathlib.PurePosixPath(member.filename)
            if path.name == "mongod.exe" or path.suffix.lower() == ".dll" or path.name.lower().startswith(("license", "third-party", "mpl-")):
                members.append(member)
        if not any(pathlib.PurePosixPath(item.filename).name == "mongod.exe" for item in members):
            raise RuntimeError("The official archive did not contain mongod.exe.")
        for member in members:
            path = pathlib.PurePosixPath(member.filename)
            target = DESTINATION / ("bin" if path.suffix.lower() in (".exe", ".dll") else "licenses") / path.name
            print(f"Downloading {path.name} ({member.compress_size // 1024 // 1024} MB compressed)...", flush=True)
            content = archive.read(member)
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(content)
    print(f"MongoDB installed in {DESTINATION}", flush=True)


if __name__ == "__main__":
    main()
