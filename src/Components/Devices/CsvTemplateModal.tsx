import { useState } from 'react';
import { Download } from "lucide-react";
import ActionButton from '../ActionButtonComponent/ActionButton';
import { SelectInput } from '../InputComponent/Input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';

type Template = {
    id: string;
    name: string;
    fileUrl: string;
    columns: { key: string; description: string }[];
};

const templates: Template[] = [
    {
        id: 'nontokenable',
        name: 'Non tokenable Device Upload Template',
        fileUrl: '/device-csv-templates/nontokenable.csv',
        columns: [
            { key: 'Serial Number', description: 'Unique code printed on each device' },
        ],
    },
    {
        id: 'tokenable',
        name: 'Tokenable Device Upload Template',
        fileUrl: '/device-csv-templates/tokenable.csv',
        columns: [
            { key: 'Serial Number', description: 'Unique code printed on each device' },
            { key: 'Starting Code', description: "This is an optional “override” PIN you can set instead of the system’s default. Imagine that instead of using the usual scratch-off airtime code, you scratch a special card with your own secret number. You don’t have to use it, but it lets you pick exactly where your device “starts” its token count." },
            { key: 'Key', description: 'Think of this as your device’s super-secret, 32-character “master PIN.” It’s like a super-long scratch-card code that only your system knows. That code is used behind the scenes to generate the one-time “unlock” tokens for your device' },
            { key: 'Count', description: 'Every time you generate a new token, you increase this number by one. It’s like numbering your airtime recharge cards: once you’ve used card #1 you move to #2, and so on—so nobody can ever reuse the same token twice.' },
            { key: 'Time Divider', description: 'This is a way to stretch or shrink how much “time value” each token gives you. Think of it as deciding whether one token buys you one day, one hour, or even one minute of unlocked device time—by dividing the total into smaller pieces' },
            { key: 'Firmware Version', description: 'Current firmware on the device' },
            { key: 'Hardware Model', description: 'Model number of the device' },
        ],
    },
];

// columns: [
//     {
//         key: 'Serial Number',
//         description: 'Your device’s unique ID—like the IMEI on your phone.'
//     },
//     {
//         key: 'Starting Code',
//         description: 'An optional first PIN you set to kick things off.'
//     },
//     {
//         key: 'Key',
//         description: 'A long, secret “master” PIN used to make one-time unlock codes.'
//     },
//     {
//         key: 'Count',
//         description: 'A number that goes up by 1 each time you make a new token—so they can’t be reused.'
//     },
//     {
//         key: 'Time Divider',
//         description: 'Decides if one token buys you 1 day, 1 hour, or smaller blocks of time.'
//     },
//     {
//         key: 'Firmware Version',
//         description: 'The software release your device is running.'
//     },
//     {
//         key: 'Hardware Model',
//         description: 'The exact make/model name (e.g. “X200”) of your device.'
//     },
// ];


export default function CsvTemplateModal({ open = false, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {

    const [selectedId, setSelectedId] = useState<string>(templates[0].id);

    const selected = templates.find(t => t.id === selectedId)!;
    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = selected.fileUrl;
        link.download = `${selected.name.replace(/\s+/g, '_').toLowerCase()}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Sample CSV Templates</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <SelectInput
                                label="Template"
                                options={templates.map(t => ({ value: t.id, label: t.name }))}
                                value={selectedId}
                                onChange={setSelectedId}
                                placeholder="Select a template"
                            />
                        </div>

                        <div className="space-y-2">
                            {selected.columns.map(col => (
                                <div key={col.key} className="flex flex-col start">
                                    <span className="font-medium">{col.key}</span>
                                    <span className="text-sm text-gray-600">{col.description}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <DialogFooter>

                        <ActionButton
                            label={`Download ${selected.name}`}
                            icon={<Download className="mr-2 h-4 w-4 text-customButtonText " />}
                            onClick={handleDownload}
                        />

                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
