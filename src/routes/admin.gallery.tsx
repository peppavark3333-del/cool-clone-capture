import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { supabase } from "@/integrations/supabase/client";
import { logAudit } from "@/hooks/use-admin";
import { toast } from "sonner";
import { Plus, Trash2, ImagePlus, Eye, EyeOff, ArrowUp, ArrowDown, Upload } from "lucide-react";

export const Route = createFileRoute("/admin/gallery")({
  component: Gallery,
});

type Album = { id: string; title: string; description: string | null; sort_order: number; published: boolean };
type Photo = { id: string; album_id: string | null; url: string; caption: string | null; photo_type: "standard" | "before" | "after"; sort_order: number };

function Gallery() {
  const qc = useQueryClient();
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const [newAlbumTitle, setNewAlbumTitle] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: albums = [] } = useQuery({
    queryKey: ["albums"],
    queryFn: async () => {
      const { data, error } = await supabase.from("gallery_albums").select("*").order("sort_order").order("created_at");
      if (error) throw error;
      return data as Album[];
    },
  });

  const { data: photos = [] } = useQuery({
    queryKey: ["photos", selectedAlbum],
    queryFn: async () => {
      if (!selectedAlbum) return [];
      const { data } = await supabase.from("gallery_photos").select("*").eq("album_id", selectedAlbum).order("sort_order");
      const list = (data ?? []) as Photo[];
      return Promise.all(list.map(async (p) => {
        if (p.url.startsWith("http")) return p;
        const { data: signed } = await supabase.storage.from("gallery").createSignedUrl(p.url, 3600);
        return { ...p, url: signed?.signedUrl ?? p.url };
      }));
    },
    enabled: !!selectedAlbum,
  });

  const createAlbum = async () => {
    if (!newAlbumTitle) return;
    const { error } = await supabase.from("gallery_albums").insert({ title: newAlbumTitle, sort_order: albums.length });
    if (error) return toast.error(error.message);
    await logAudit("album_create", "album", undefined, { title: newAlbumTitle });
    toast.success("Album created");
    setNewAlbumTitle("");
    qc.invalidateQueries({ queryKey: ["albums"] });
  };

  const togglePublished = async (a: Album) => {
    await supabase.from("gallery_albums").update({ published: !a.published }).eq("id", a.id);
    qc.invalidateQueries({ queryKey: ["albums"] });
  };

  const deleteAlbum = async (id: string) => {
    if (!confirm("Delete album and all its photos?")) return;
    await supabase.from("gallery_albums").delete().eq("id", id);
    await logAudit("album_delete", "album", id);
    if (selectedAlbum === id) setSelectedAlbum(null);
    qc.invalidateQueries({ queryKey: ["albums"] });
  };

  const moveAlbum = async (a: Album, dir: -1 | 1) => {
    const idx = albums.findIndex((x) => x.id === a.id);
    const swap = albums[idx + dir];
    if (!swap) return;
    await supabase.from("gallery_albums").update({ sort_order: swap.sort_order }).eq("id", a.id);
    await supabase.from("gallery_albums").update({ sort_order: a.sort_order }).eq("id", swap.id);
    qc.invalidateQueries({ queryKey: ["albums"] });
  };

  const upload = async (files: FileList | null) => {
    if (!files || !selectedAlbum) return;
    for (const file of Array.from(files)) {
      const path = `${selectedAlbum}/${crypto.randomUUID()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from("gallery").upload(path, file);
      if (upErr) { toast.error(upErr.message); continue; }
      await supabase.from("gallery_photos").insert({
        album_id: selectedAlbum, url: path, sort_order: photos.length,
      });
    }
    await logAudit("photo_upload", "album", selectedAlbum, { count: files.length });
    toast.success("Uploaded");
    qc.invalidateQueries({ queryKey: ["photos"] });
  };

  const addByUrl = async () => {
    if (!selectedAlbum) return;
    const url = prompt("Image URL:");
    if (!url) return;
    const caption = prompt("Caption (optional):") ?? "";
    await supabase.from("gallery_photos").insert({ album_id: selectedAlbum, url, caption, sort_order: photos.length });
    qc.invalidateQueries({ queryKey: ["photos"] });
  };

  const deletePhoto = async (p: Photo) => {
    if (!confirm("Delete photo?")) return;
    if (!p.url.startsWith("http")) await supabase.storage.from("gallery").remove([p.url]);
    await supabase.from("gallery_photos").delete().eq("id", p.id);
    qc.invalidateQueries({ queryKey: ["photos"] });
  };

  const updatePhoto = async (p: Photo, patch: Partial<Photo>) => {
    await supabase.from("gallery_photos").update(patch).eq("id", p.id);
    qc.invalidateQueries({ queryKey: ["photos"] });
  };

  return (
    <AdminShell title="Gallery">
      <div className="grid lg:grid-cols-[300px_1fr] gap-5">
        <div>
          <div className="rounded-2xl border border-border bg-background p-4">
            <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">Albums</h3>
            <div className="space-y-1 mb-3">
              {albums.map((a, i) => (
                <div key={a.id} className={`group flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm ${selectedAlbum === a.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                  <button onClick={() => setSelectedAlbum(a.id)} className="flex-1 text-left truncate">{a.title}</button>
                  <button onClick={() => moveAlbum(a, -1)} disabled={i === 0} className="opacity-0 group-hover:opacity-100 disabled:opacity-20"><ArrowUp className="h-3 w-3" /></button>
                  <button onClick={() => moveAlbum(a, 1)} disabled={i === albums.length - 1} className="opacity-0 group-hover:opacity-100 disabled:opacity-20"><ArrowDown className="h-3 w-3" /></button>
                  <button onClick={() => togglePublished(a)} className="opacity-0 group-hover:opacity-100">{a.published ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3 text-orange-500" />}</button>
                  <button onClick={() => deleteAlbum(a.id)} className="opacity-0 group-hover:opacity-100"><Trash2 className="h-3 w-3 text-destructive" /></button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={newAlbumTitle} onChange={(e) => setNewAlbumTitle(e.target.value)} placeholder="New album" className="flex-1 rounded-md border border-border bg-card px-2 py-1.5 text-sm" />
              <button onClick={createAlbum} className="rounded-md bg-primary text-primary-foreground px-2"><Plus className="h-4 w-4" /></button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-background p-5 min-h-[400px]">
          {selectedAlbum ? (
            <>
              <div className="flex flex-wrap gap-2 mb-4">
                <button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-medium"><Upload className="h-4 w-4" /> Upload</button>
                <button onClick={addByUrl} className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium"><ImagePlus className="h-4 w-4" /> Add by URL</button>
                <input ref={fileRef} type="file" multiple accept="image/*" hidden onChange={(e) => upload(e.target.files)} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {photos.map((p) => (
                  <figure key={p.id} className="rounded-xl border border-border bg-card overflow-hidden">
                    <img src={p.url} alt={p.caption ?? ""} className="aspect-[4/3] w-full object-cover" />
                    <div className="p-2 space-y-2">
                      <input defaultValue={p.caption ?? ""} onBlur={(e) => updatePhoto(p, { caption: e.target.value })} placeholder="Caption" className="w-full text-xs rounded border border-border px-2 py-1" />
                      <div className="flex gap-1">
                        <select defaultValue={p.photo_type} onChange={(e) => updatePhoto(p, { photo_type: e.target.value as Photo["photo_type"] })} className="flex-1 text-xs rounded border border-border px-2 py-1 bg-background">
                          <option value="standard">Standard</option><option value="before">Before</option><option value="after">After</option>
                        </select>
                        <button onClick={() => deletePhoto(p)} className="text-destructive p-1 hover:bg-destructive/10 rounded"><Trash2 className="h-3 w-3" /></button>
                      </div>
                    </div>
                  </figure>
                ))}
                {photos.length === 0 && <div className="sm:col-span-2 lg:col-span-3 text-center text-muted-foreground py-10 text-sm">No photos in this album yet.</div>}
              </div>
            </>
          ) : (
            <div className="text-center text-muted-foreground py-20 text-sm">Select or create an album to manage photos.</div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
