import ui from "../../ui";
import { Context } from "../../ui.server";

class ImageUploadForm {
    Title = "";
    Description = "";
    ImageName = "";
    ImageSize = 0;
}

export function ImageUploadContent(ctx: Context): string {
    return render(ctx, new ImageUploadForm(), "");
}

function submitImage(ctx: Context): string {
    const form = new ImageUploadForm();
    ctx.Body(form);

    if (!form.Title) {
        ctx.Error("Title is required");
        return render(ctx, form, "");
    }

    if (!form.ImageName) {
        ctx.Error("Please choose an image file");
        return render(ctx, form, "");
    }

    const sizeKB = Math.max(1, Math.round(form.ImageSize / 1024));
    const info = ui.div("rounded-lg border border-green-300 bg-green-50 p-4 text-green-800")(
        ui.div("font-semibold mb-1")("Image metadata captured"),
        ui.div("text-sm")("Title: " + form.Title),
        ui.div("text-sm")("File: " + form.ImageName + " (" + String(sizeKB) + " KB)"),
        ui.div("text-xs mt-2 text-green-700")(
            "Note: t-sui example currently captures metadata and preview in-browser. Server-side binary upload API can be added later.",
        ),
    );

    ctx.Success("Image metadata submitted");
    return render(ctx, new ImageUploadForm(), info);
}
submitImage.url = "/image-upload-submit";

function render(ctx: Context, data: ImageUploadForm, message: string): string {
    const target = ui.Target();

    return ui.div("space-y-6", target)(
        ui.div("text-3xl font-bold")("Image Upload"),
        ui.div("text-gray-600")(
            "Upload a file to preview it and submit basic metadata through the standard form flow.",
        ),
        ui.form("bg-white p-6 rounded-lg border border-gray-200 shadow space-y-4", target, ctx.Submit(submitImage).Replace(target))(
            ui.IText("Title", data).Required().Placeholder("My screenshot").Render("Title"),
            ui.IArea("Description", data).Rows(3).Placeholder("Optional description").Render("Description"),
            ui.Hidden("ImageName", "string", data.ImageName),
            ui.Hidden("ImageSize", "number", data.ImageSize),
            ui.label("block text-sm font-medium text-gray-700")("Image File"),
            ui.input("block w-full border border-gray-300 rounded p-2", {
                type: "file",
                accept: "image/*",
                onchange: "(function(input){var f=input.files&&input.files[0];var n=document.querySelector('input[name=ImageName]');var s=document.querySelector('input[name=ImageSize]');var p=document.getElementById('image-upload-preview');if(!f){if(n)n.value='';if(s)s.value='0';if(p){p.src='';p.style.display='none';}return;}if(n)n.value=f.name;if(s)s.value=String(f.size||0);if(p){p.src=URL.createObjectURL(f);p.style.display='block';}})(this)",
            }),
            ui.img("mt-3 max-h-64 rounded border border-gray-200 hidden", {
                id: "image-upload-preview",
                alt: "Preview",
            }),
            ui.div("text-xs text-gray-500")(
                "Accepted formats: PNG, JPG, GIF, WebP. Metadata only in this example.",
            ),
            ui.div("flex justify-end")(
                ui.Button().Submit().Color(ui.Blue).Class("rounded").Render("Submit"),
            ),
        ),
        message,
    );
}
