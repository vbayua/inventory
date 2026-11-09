import InputError from '@/components/input-error';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Role } from '@/types';

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

type RoleCheckboxListProps = {
    roles: Role[];
    selectedRoleNames: string[];
    onChange: (roleNames: string[]) => void;
    error?: string;
};

export default function RoleCheckboxList({ roles, selectedRoleNames, onChange, error }: RoleCheckboxListProps) {
    const toggleRole = (roleName: string, isChecked: boolean) => {
        onChange(isChecked ? [...selectedRoleNames, roleName] : selectedRoleNames.filter((selected) => selected !== roleName));
    };

    return (
        <fieldset className="mt-4 flex flex-col gap-2">
            <legend className="text-sm font-medium">Roles</legend>
            {roles.map((role) => (
                <div key={role.id} className="flex items-start gap-2">
                    <Checkbox
                        id={`role-${role.id}`}
                        checked={selectedRoleNames.includes(role.name)}
                        onCheckedChange={(checked) => toggleRole(role.name, checked === true)}
                    />
                    <Label htmlFor={`role-${role.id}`} className="flex flex-col items-start gap-0.5 font-normal">
                        <span className="font-medium">{capitalize(role.name)}</span>
                        {role.description && <span className="text-muted-foreground text-xs">{role.description}</span>}
                    </Label>
                </div>
            ))}
            <InputError message={error} />
        </fieldset>
    );
}
