import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'aisIdeaqru';
  trails: { id: string; x: number; y: number }[] = []; // Array untuk titik-titik sementara

  ngOnInit(): void {
    document.addEventListener('mousemove', (event: MouseEvent) => {
      const { clientX, clientY } = event;

      // Tambahkan titik baru di posisi kursor
      const id = this.generateId();
      this.trails.push({ id, x: clientX, y: clientY });

      // Hapus titik setelah animasi selesai (1 detik)
      setTimeout(() => {
        this.trails = this.trails.filter((trail) => trail.id !== id);
      }, 2000);
    });
  }

  // Fungsi untuk membuat ID unik untuk setiap titik
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}
