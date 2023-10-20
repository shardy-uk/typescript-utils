type UndoFunction = () => Promise<any>;

export class PouchTransaction {
    public undoFunctions: UndoFunction[] = [];

    registerUndo(undoFunction: UndoFunction) {
        this.undoFunctions.push(undoFunction);
    }

    async rollback() {
        for (const undo of this.undoFunctions.reverse()) {
            await undo();
        }
    }
}
