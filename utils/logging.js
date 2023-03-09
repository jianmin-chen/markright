export default function catchError({ toast, err }) {
    toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: `Looks like there was a bug: ${err}`
    });
}
